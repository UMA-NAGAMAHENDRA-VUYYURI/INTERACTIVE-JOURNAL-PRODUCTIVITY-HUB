document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const clearAllBtn = document.getElementById('clear-all');
    const themeSwitcher = document.getElementById('theme-switcher');
    const totalTasksSpan = document.getElementById('total-tasks');
    const completedTasksSpan = document.getElementById('completed-tasks');
    const pendingTasksSpan = document.getElementById('pending-tasks');

    // Initialize tasks array from localStorage or empty array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Initialize theme from localStorage or default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', currentTheme === 'dark');
    themeSwitcher.checked = currentTheme === 'dark';

    // Render tasks based on current filter
    renderTasks();

    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    clearAllBtn.addEventListener('click', clearAllTasks);
    themeSwitcher.addEventListener('change', toggleTheme);

    // Filter button event listeners
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderTasks();
        });
    });

    // Function to add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            showAlert('Please enter a task', 'error');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            date: new Date().toLocaleDateString()
        };

        tasks.push(newTask);
        saveTasks();
        taskInput.value = '';
        renderTasks();
        showAlert('Task added successfully!', 'success');
    }

    // Function to render tasks based on current filter
    function renderTasks() {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        
        let filteredTasks = tasks;
        if (activeFilter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (activeFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = activeFilter === 'all' ? 'No tasks yet. Add one above!' : 
                                      activeFilter === 'pending' ? 'No pending tasks!' : 'No completed tasks yet!';
            emptyMessage.classList.add('empty-message');
            taskList.appendChild(emptyMessage);
        } else {
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = 'task-item';
                taskItem.dataset.id = task.id;

                taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                    <span class="task-date">${task.date}</span>
                    <i class="fas fa-trash delete-btn"></i>
                `;

                taskList.appendChild(taskItem);
            });
        }

        // Update task stats
        updateTaskStats();
    }

    // Function to handle task completion toggle
    function toggleTaskCompletion(taskId) {
        tasks = tasks.map(task => {
            if (task.id === Number(taskId)) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }

    // Function to delete a task
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== Number(taskId));
        saveTasks();
        renderTasks();
        showAlert('Task deleted successfully!', 'success');
    }

    // Function to clear all completed tasks
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        showAlert('Completed tasks cleared!', 'success');
    }

    // Function to clear all tasks
    function clearAllTasks() {
        if (tasks.length === 0) {
            showAlert('No tasks to clear!', 'error');
            return;
        }
        
        if (confirm('Are you sure you want to delete all tasks?')) {
            tasks = [];
            saveTasks();
            renderTasks();
            showAlert('All tasks cleared!', 'success');
        }
    }

    // Function to update task statistics
    function updateTaskStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        totalTasksSpan.textContent = `Total: ${totalTasks}`;
        completedTasksSpan.textContent = `Completed: ${completedTasks}`;
        pendingTasksSpan.textContent = `Pending: ${pendingTasks}`;
    }

    // Function to save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Function to toggle theme
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    }

    // Function to show alert message
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${type}`;
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.classList.add('fade-out');
            setTimeout(() => {
                alertDiv.remove();
            }, 500);
        }, 3000);
    }

    // Event delegation for dynamic elements
    taskList.addEventListener('click', function(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;

        if (e.target.classList.contains('delete-btn')) {
            deleteTask(taskItem.dataset.id);
        } else if (e.target.classList.contains('task-checkbox')) {
            toggleTaskCompletion(taskItem.dataset.id);
        }
    });

    // Add some initial styles for alerts
    const style = document.createElement('style');
    style.textContent = `
        .alert {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            opacity: 1;
            transition: opacity 0.5s ease;
        }
        .alert.success {
            background-color: #4CAF50;
        }
        .alert.error {
            background-color: #f44336;
        }
        .alert.fade-out {
            opacity: 0;
        }
    `;
    document.head.appendChild(style);
});