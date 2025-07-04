/**
 * To-Do List 应用主逻辑
 * 功能：任务的增删改查、状态管理、数据持久化
 */

// ===== 应用状态管理 =====
class TodoApp {
    constructor() {
        // 任务数据存储
        this.tasks = [];
        // 当前筛选状态
        this.currentFilter = 'all';
        // 编辑中的任务ID
        this.editingTaskId = null;
        
        // 初始化应用
        this.init();
    }

    /**
     * 应用初始化
     */
    init() {
        // 加载本地存储的数据
        this.loadFromStorage();
        
        // 绑定事件监听器
        this.bindEvents();
        
        // 渲染初始界面
        this.render();
        
        // 设置键盘快捷键
        this.setupKeyboardShortcuts();
        
        console.log('To-Do List 应用已启动');
    }

    /**
     * 绑定所有事件监听器
     */
    bindEvents() {
        // 获取DOM元素
        const taskInput = document.getElementById('taskInput');
        const addBtn = document.getElementById('addBtn');
        const clearCompletedBtn = document.getElementById('clearCompleted');
        const markAllCompleteBtn = document.getElementById('markAllComplete');
        
        // 添加任务事件
        addBtn.addEventListener('click', () => this.addTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // 统计区域点击事件 - 实现筛选功能
        const statItems = document.querySelectorAll('.stat-item');
        statItems.forEach((item, index) => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                const filters = ['all', 'pending', 'completed'];
                this.setFilter(filters[index]);
            });
        });
        
        // 批量操作事件
        clearCompletedBtn.addEventListener('click', () => {
            this.showConfirmModal(
                '清除已完成任务',
                '确定要删除所有已完成的任务吗？此操作不可撤销。',
                () => this.clearCompleted()
            );
        });
        
        markAllCompleteBtn.addEventListener('click', () => {
            this.markAllComplete();
        });
        
        // 模态框事件
        this.bindModalEvents();
    }

    /**
     * 绑定模态框相关事件
     */
    bindModalEvents() {
        // 确认模态框
        const confirmModal = document.getElementById('confirmModal');
        const modalClose = document.getElementById('modalClose');
        const modalCancel = document.getElementById('modalCancel');
        const modalConfirm = document.getElementById('modalConfirm');
        
        // 编辑模态框
        const editModal = document.getElementById('editModal');
        const editModalClose = document.getElementById('editModalClose');
        const editCancel = document.getElementById('editCancel');
        const editSave = document.getElementById('editSave');
        const editTaskInput = document.getElementById('editTaskInput');
        
        // 确认模态框事件
        [modalClose, modalCancel].forEach(btn => {
            btn.addEventListener('click', () => this.hideConfirmModal());
        });
        
        modalConfirm.addEventListener('click', () => {
            if (this.confirmCallback) {
                this.confirmCallback();
                this.hideConfirmModal();
            }
        });
        
        // 编辑模态框事件
        [editModalClose, editCancel].forEach(btn => {
            btn.addEventListener('click', () => this.hideEditModal());
        });
        
        editSave.addEventListener('click', () => this.saveEdit());
        
        editTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveEdit();
            }
        });
        
        // 点击模态框背景关闭
        [confirmModal, editModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modal === confirmModal) {
                        this.hideConfirmModal();
                    } else {
                        this.hideEditModal();
                    }
                }
            });
        });
    }

    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter: 添加任务
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.addTask();
            }
            
            // Escape: 关闭模态框
            if (e.key === 'Escape') {
                this.hideConfirmModal();
                this.hideEditModal();
            }
            
            // 数字键切换筛选
            if (e.key >= '1' && e.key <= '3' && !e.ctrlKey && !e.metaKey) {
                const filters = ['all', 'pending', 'completed'];
                const filterIndex = parseInt(e.key) - 1;
                if (filters[filterIndex]) {
                    this.setFilter(filters[filterIndex]);
                }
            }
        });
    }

    /**
     * 添加新任务
     */
    addTask() {
        const taskInput = document.getElementById('taskInput');
        const text = taskInput.value.trim();
        
        if (!text) {
            this.showNotification('请输入任务内容', 'warning');
            taskInput.focus();
            return;
        }
        
        if (text.length > 200) {
            this.showNotification('任务内容不能超过200个字符', 'error');
            return;
        }
        
        // 创建新任务对象
        const task = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        // 添加到任务列表
        this.tasks.unshift(task);
        
        // 清空输入框
        taskInput.value = '';
        
        // 保存到本地存储
        this.saveToStorage();
        
        // 重新渲染
        this.render();
        
        // 显示成功提示
        this.showNotification('任务添加成功', 'success');
        
        // 聚焦输入框
        taskInput.focus();
    }

    /**
     * 删除任务
     * @param {string} taskId - 任务ID
     */
    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;
        
        const task = this.tasks[taskIndex];
        
        this.showConfirmModal(
            '删除任务',
            `确定要删除任务"${task.text}"吗？此操作不可撤销。`,
            () => {
                this.tasks.splice(taskIndex, 1);
                this.saveToStorage();
                this.render();
                this.showNotification('任务删除成功', 'success');
            }
        );
    }

    /**
     * 切换任务完成状态
     * @param {string} taskId - 任务ID
     */
    toggleTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (!task) return;
        
        task.completed = !task.completed;
        task.updatedAt = new Date();
        
        this.saveToStorage();
        this.render();
        
        const status = task.completed ? '已完成' : '未完成';
        this.showNotification(`任务标记为${status}`, 'success');
    }

    /**
     * 编辑任务
     * @param {string} taskId - 任务ID
     */
    editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (!task) return;
        
        this.editingTaskId = taskId;
        
        // 显示编辑模态框
        const editModal = document.getElementById('editModal');
        const editTaskInput = document.getElementById('editTaskInput');
        
        editTaskInput.value = task.text;
        editModal.classList.add('show');
        
        // 聚焦并选中文本
        setTimeout(() => {
            editTaskInput.focus();
            editTaskInput.select();
        }, 100);
    }

    /**
     * 保存编辑
     */
    saveEdit() {
        const editTaskInput = document.getElementById('editTaskInput');
        const newText = editTaskInput.value.trim();
        
        if (!newText) {
            this.showNotification('任务内容不能为空', 'warning');
            editTaskInput.focus();
            return;
        }
        
        if (newText.length > 200) {
            this.showNotification('任务内容不能超过200个字符', 'error');
            return;
        }
        
        const task = this.tasks.find(task => task.id === this.editingTaskId);
        if (task) {
            task.text = newText;
            task.updatedAt = new Date();
            
            this.saveToStorage();
            this.render();
            this.showNotification('任务更新成功', 'success');
        }
        
        this.hideEditModal();
    }

    /**
     * 设置筛选条件
     * @param {string} filter - 筛选类型 (all|pending|completed)
     */
    setFilter(filter) {
        this.currentFilter = filter;
        
        // 更新统计区域的活跃状态
        const statItems = document.querySelectorAll('.stat-item');
        const filterIndex = ['all', 'pending', 'completed'].indexOf(filter);
        
        statItems.forEach((item, index) => {
            item.classList.remove('active');
            if (index === filterIndex) {
                item.classList.add('active');
            }
        });
        
        // 重新渲染任务列表
        this.renderTasks();
    }

    /**
     * 清除所有已完成任务
     */
    clearCompleted() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        
        if (completedCount === 0) {
            this.showNotification('没有已完成的任务需要清除', 'info');
            return;
        }
        
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveToStorage();
        this.render();
        
        this.showNotification(`已清除 ${completedCount} 个已完成任务`, 'success');
    }

    /**
     * 标记所有任务为已完成
     */
    markAllComplete() {
        const pendingTasks = this.tasks.filter(task => !task.completed);
        
        if (pendingTasks.length === 0) {
            this.showNotification('所有任务都已完成', 'info');
            return;
        }
        
        pendingTasks.forEach(task => {
            task.completed = true;
            task.updatedAt = new Date();
        });
        
        this.saveToStorage();
        this.render();
        
        this.showNotification(`已标记 ${pendingTasks.length} 个任务为完成`, 'success');
    }

    /**
     * 获取筛选后的任务列表
     * @returns {Array} 筛选后的任务数组
     */
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    /**
     * 渲染整个应用界面
     */
    render() {
        this.renderStats();
        this.renderTasks();
        this.updateActionButtons();
    }

    /**
     * 渲染统计信息
     */
    renderStats() {
        const totalTasks = this.tasks.length;
        const pendingTasks = this.tasks.filter(task => !task.completed).length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
    }

    /**
     * 渲染任务列表
     */
    renderTasks() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();
        
        // 清空现有内容
        taskList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            // 显示空状态
            emptyState.style.display = 'block';
            return;
        }
        
        // 隐藏空状态
        emptyState.style.display = 'none';
        
        // 渲染任务项
        filteredTasks.forEach(task => {
            const taskItem = this.createTaskElement(task);
            taskList.appendChild(taskItem);
        });
    }

    /**
     * 创建任务DOM元素
     * @param {Object} task - 任务对象
     * @returns {HTMLElement} 任务DOM元素
     */
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.taskId = task.id;
        
        li.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                 onclick="app.toggleTask('${task.id}')" 
                 title="${task.completed ? '标记为未完成' : '标记为已完成'}">
                ${task.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <span class="task-text" onclick="app.editTask('${task.id}')" title="点击编辑">
                ${this.escapeHtml(task.text)}
            </span>
            <div class="task-actions">
                <button class="task-btn edit-btn" 
                        onclick="app.editTask('${task.id}')" 
                        title="编辑任务">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-btn delete-btn" 
                        onclick="app.deleteTask('${task.id}')" 
                        title="删除任务">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return li;
    }

    /**
     * 更新批量操作按钮状态
     */
    updateActionButtons() {
        const clearCompletedBtn = document.getElementById('clearCompleted');
        const markAllCompleteBtn = document.getElementById('markAllComplete');
        
        const completedCount = this.tasks.filter(task => task.completed).length;
        const pendingCount = this.tasks.filter(task => !task.completed).length;
        
        // 更新清除已完成按钮
        clearCompletedBtn.disabled = completedCount === 0;
        clearCompletedBtn.style.opacity = completedCount === 0 ? '0.5' : '1';
        
        // 更新全部完成按钮
        markAllCompleteBtn.disabled = pendingCount === 0;
        markAllCompleteBtn.style.opacity = pendingCount === 0 ? '0.5' : '1';
        
        // 更新按钮文本
        if (pendingCount === 0 && this.tasks.length > 0) {
            markAllCompleteBtn.innerHTML = '<i class="fas fa-undo"></i> 全部重置';
            markAllCompleteBtn.onclick = () => this.markAllIncomplete();
        } else {
            markAllCompleteBtn.innerHTML = '<i class="fas fa-check-double"></i> 全部完成';
            markAllCompleteBtn.onclick = () => this.markAllComplete();
        }
    }

    /**
     * 标记所有任务为未完成
     */
    markAllIncomplete() {
        const completedTasks = this.tasks.filter(task => task.completed);
        
        if (completedTasks.length === 0) {
            this.showNotification('没有已完成的任务需要重置', 'info');
            return;
        }
        
        completedTasks.forEach(task => {
            task.completed = false;
            task.updatedAt = new Date();
        });
        
        this.saveToStorage();
        this.render();
        
        this.showNotification(`已重置 ${completedTasks.length} 个任务状态`, 'success');
    }

    /**
     * 显示确认模态框
     * @param {string} title - 标题
     * @param {string} message - 消息内容
     * @param {Function} callback - 确认回调函数
     */
    showConfirmModal(title, message, callback) {
        const modal = document.getElementById('confirmModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        this.confirmCallback = callback;
        
        modal.classList.add('show');
    }

    /**
     * 隐藏确认模态框
     */
    hideConfirmModal() {
        const modal = document.getElementById('confirmModal');
        modal.classList.remove('show');
        this.confirmCallback = null;
    }

    /**
     * 隐藏编辑模态框
     */
    hideEditModal() {
        const modal = document.getElementById('editModal');
        modal.classList.remove('show');
        this.editingTaskId = null;
    }

    /**
     * 显示通知消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 (success|error|warning|info)
     */
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // 添加样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '9999',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '200px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: this.getNotificationColor(type)
        });
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 获取通知图标
     * @param {string} type - 通知类型
     * @returns {string} 图标类名
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * 获取通知颜色
     * @param {string} type - 通知类型
     * @returns {string} 颜色值
     */
    getNotificationColor(type) {
        const colors = {
            success: '#00d4aa',
            error: '#ff6b6b',
            warning: '#ffb347',
            info: '#667eea'
        };
        return colors[type] || '#667eea';
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一标识符
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * HTML转义
     * @param {string} text - 需要转义的文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 保存数据到本地存储
     */
    saveToStorage() {
        try {
            const data = {
                tasks: this.tasks,
                currentFilter: this.currentFilter,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('todoapp_data', JSON.stringify(data));
        } catch (error) {
            console.error('保存数据失败:', error);
            this.showNotification('数据保存失败', 'error');
        }
    }

    /**
     * 从本地存储加载数据
     */
    loadFromStorage() {
        try {
            const savedData = localStorage.getItem('todoapp_data');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // 恢复任务数据
                this.tasks = data.tasks || [];
                
                // 转换日期字符串为Date对象
                this.tasks.forEach(task => {
                    if (task.createdAt) task.createdAt = new Date(task.createdAt);
                    if (task.updatedAt) task.updatedAt = new Date(task.updatedAt);
                });
                
                // 恢复筛选状态
                this.currentFilter = data.currentFilter || 'all';
                
                console.log(`已加载 ${this.tasks.length} 个任务`);
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showNotification('数据加载失败，将使用默认设置', 'warning');
            this.tasks = [];
        }
    }

    /**
     * 导出数据
     * @returns {string} JSON格式的数据
     */
    exportData() {
        const data = {
            tasks: this.tasks,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * 导入数据
     * @param {string} jsonData - JSON格式的数据
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.tasks && Array.isArray(data.tasks)) {
                this.tasks = data.tasks;
                
                // 转换日期字符串为Date对象
                this.tasks.forEach(task => {
                    if (task.createdAt) task.createdAt = new Date(task.createdAt);
                    if (task.updatedAt) task.updatedAt = new Date(task.updatedAt);
                });
                
                this.saveToStorage();
                this.render();
                this.showNotification('数据导入成功', 'success');
            } else {
                throw new Error('无效的数据格式');
            }
        } catch (error) {
            console.error('导入数据失败:', error);
            this.showNotification('数据导入失败，请检查文件格式', 'error');
        }
    }
}

// ===== 应用启动 =====
// 等待DOM加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
    // 创建全局应用实例
    window.app = new TodoApp();
    
    // 添加一些示例数据（仅在首次使用时）
    if (window.app.tasks.length === 0) {
        const sampleTasks = [
            '欢迎使用 To-Do List 应用！',
            '点击任务文本可以编辑内容',
            '点击圆圈可以标记完成状态',
            '使用筛选按钮查看不同状态的任务'
        ];
        
        sampleTasks.forEach((text, index) => {
            const task = {
                id: window.app.generateId(),
                text: text,
                completed: index === 3, // 最后一个任务标记为已完成
                createdAt: new Date(Date.now() - (sampleTasks.length - index) * 60000),
                updatedAt: new Date(Date.now() - (sampleTasks.length - index) * 60000)
            };
            window.app.tasks.push(task);
        });
        
        window.app.saveToStorage();
        window.app.render();
    }
});

// ===== 全局错误处理 =====
window.addEventListener('error', (event) => {
    console.error('应用错误:', event.error);
    if (window.app) {
        window.app.showNotification('应用出现错误，请刷新页面', 'error');
    }
});

// ===== 页面卸载时保存数据 =====
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.saveToStorage();
    }
});

// ===== 开发者工具 =====
if (process?.env?.NODE_ENV === 'development') {
    // 开发模式下的调试功能
    window.todoDebug = {
        getTasks: () => window.app.tasks,
        clearAll: () => {
            window.app.tasks = [];
            window.app.saveToStorage();
            window.app.render();
        },
        exportData: () => window.app.exportData(),
        importData: (data) => window.app.importData(data)
    };
    
    console.log('开发模式已启用，可使用 window.todoDebug 进行调试');
}