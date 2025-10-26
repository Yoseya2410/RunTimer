class RunningTimer {
    constructor() {
        this.runners = [];
        this.timerStarted = false;
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.deferredPrompt = null; // 用于 PWA 安装提示
        
        this.initializeElements();
        this.bindEvents();
        this.renderRunners();
        this.updateTimeDisplay(); // 初始化时间显示
        this.setupPWAInstall(); // 设置 PWA 安装功能
    }
    
    initializeElements() {
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.addRunnerBtn = document.getElementById('addRunnerBtn');
        this.runnersList = document.getElementById('runners');
        this.timeDisplay = document.getElementById('timeDisplay'); // 实时计时显示元素
        
        // 弹窗相关元素
        this.modal = document.getElementById('runnerModal');
        this.runnerNamesInput = document.getElementById('runnerNamesInput');
        this.cancelModalBtn = document.getElementById('cancelModalBtn');
        this.confirmModalBtn = document.getElementById('confirmModalBtn');
        this.closeModalSpan = document.querySelector('.close');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.addRunnerBtn.addEventListener('click', () => this.openAddRunnerModal());
        
        // 弹窗相关事件
        this.cancelModalBtn.addEventListener('click', () => this.closeAddRunnerModal());
        this.confirmModalBtn.addEventListener('click', () => this.addRunnersFromModal());
        this.closeModalSpan.addEventListener('click', () => this.closeAddRunnerModal());
        
        // 点击弹窗外部关闭弹窗
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.closeAddRunnerModal();
            }
        });
        
        // 添加移动端优化
        this.addRunnerBtn.addEventListener('touchstart', () => {
            this.addRunnerBtn.style.transform = 'scale(0.98)';
        });
        
        this.addRunnerBtn.addEventListener('touchend', () => {
            this.addRunnerBtn.style.transform = '';
        });
    }
    
    // 设置 PWA 安装功能
    setupPWAInstall() {
        // 监听 beforeinstallprompt 事件
        window.addEventListener('beforeinstallprompt', (e) => {
            // 阻止默认的安装提示
            e.preventDefault();
            // 保存事件以便稍后触发
            this.deferredPrompt = e;
            // 显示自定义安装按钮（如果需要的话）
            this.showInstallPromotion();
        });
        
        // 监听应用安装成功事件
        window.addEventListener('appinstalled', () => {
            console.log('PWA 已安装');
            this.deferredPrompt = null;
            this.hideInstallPromotion();
        });
    }
    
    // 显示安装提示（可以自定义实现）
    showInstallPromotion() {
        // 可以在这里添加安装提示按钮的逻辑
        console.log('PWA 可以安装');
    }
    
    // 隐藏安装提示
    hideInstallPromotion() {
        // 可以在这里隐藏安装提示按钮
    }
    
    // 手动触发安装提示
    promptInstall() {
        if (!this.deferredPrompt) {
            return;
        }
        
        // 显示安装提示
        this.deferredPrompt.prompt();
        
        // 等待用户响应
        this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('用户接受了安装提示');
            } else {
                console.log('用户拒绝了安装提示');
            }
            this.deferredPrompt = null;
        });
    }
    
    // 合并开始和暂停功能
    toggleTimer() {
        if (this.timerStarted) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }
    
    startTimer() {
        if (!this.timerStarted) {
            this.startTime = Date.now() - this.elapsedTime;
            this.timerInterval = setInterval(() => {
                this.elapsedTime = Date.now() - this.startTime;
                this.updateTimeDisplay(); // 实时更新时间显示
            }, 10); // 更新频率为10毫秒
            this.timerStarted = true;
            this.updateStartButton();
        }
    }
    
    pauseTimer() {
        if (this.timerStarted) {
            clearInterval(this.timerInterval);
            this.timerStarted = false;
            this.updateStartButton();
        }
    }
    
    resetTimer() {
        clearInterval(this.timerInterval);
        this.timerStarted = false;
        this.elapsedTime = 0;
        this.startTime = null;
        this.updateStartButton();
        this.updateTimeDisplay(); // 重置时间显示
    }
    
    updateStartButton() {
        if (this.timerStarted) {
            this.startBtn.textContent = '暂停';
            this.startBtn.style.backgroundColor = '#fd7e14'; // 暂停时为橙色
        } else {
            this.startBtn.textContent = '开始';
            this.startBtn.style.backgroundColor = '#28a745'; // 开始时为绿色
        }
    }
    
    // 更新时间显示
    updateTimeDisplay() {
        this.timeDisplay.textContent = this.formatTime(this.elapsedTime);
    }
    
    // 打开添加运动员弹窗
    openAddRunnerModal() {
        this.modal.style.display = 'block';
        this.runnerNamesInput.focus();
    }
    
    // 关闭添加运动员弹窗
    closeAddRunnerModal() {
        this.modal.style.display = 'none';
        this.runnerNamesInput.value = '';
    }
    
    // 从弹窗添加运动员
    addRunnersFromModal() {
        const names = this.runnerNamesInput.value.trim();
        if (names) {
            this.addRunners(names);
        }
        this.closeAddRunnerModal();
    }
    
    addRunners(names) {
        const nameList = names.trim();
        if (nameList) {
            // 按空格分割姓名并过滤掉空字符串
            const nameArray = nameList.split(' ').filter(name => name.trim() !== '');
            
            // 为每个姓名创建一个运动员对象
            nameArray.forEach(name => {
                const runner = {
                    id: Date.now() + Math.random(), // 使用时间戳+随机数作为唯一ID
                    name: name.trim(),
                    laps: []
                };
                this.runners.push(runner);
                
                // 添加成功反馈
                this.showNotification(`已添加运动员: ${name.trim()}`);
            });
            
            this.renderRunners();
        }
    }
    
    addLap(runnerId) {
        const runner = this.runners.find(r => r.id === runnerId);
        if (runner && this.timerStarted) {
            const lapTime = this.elapsedTime;
            let lapDuration = 0;
            
            if (runner.laps.length > 0) {
                // 计算与上一圈的时间差
                lapDuration = lapTime - runner.laps[runner.laps.length - 1].time;
            } else {
                // 第一圈
                lapDuration = lapTime;
            }
            
            runner.laps.push({
                lap: runner.laps.length + 1,
                time: lapTime,
                duration: lapDuration
            });
            
            this.renderRunners();
            
            // 添加成功反馈
            this.showNotification(`已记录 ${runner.name} 第${runner.laps.length}圈`);
        }
    }
    
    deleteRunner(runnerId) {
        const runner = this.runners.find(r => r.id === runnerId);
        if (runner && confirm(`确定要删除运动员 "${runner.name}" 吗？`)) {
            this.runners = this.runners.filter(r => r.id !== runnerId);
            this.renderRunners();
            
            // 添加删除成功反馈
            this.showNotification(`已删除运动员: ${runner.name}`);
        }
    }
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    
    showNotification(message) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        notification.style.color = 'white';
        notification.style.padding = '12px 24px';
        notification.style.borderRadius = '50px';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        notification.style.fontSize = '14px';
        notification.style.fontWeight = '500';
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // 3秒后移除
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    renderRunners() {
        this.runnersList.innerHTML = '';
        
        this.runners.forEach(runner => {
            const li = document.createElement('li');
            li.className = 'runner-item';
            li.dataset.id = runner.id;
            
            // 创建运动员项内容
            const headerDiv = document.createElement('div');
            headerDiv.className = 'runner-item-header';
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'runner-name';
            nameDiv.textContent = runner.name;
            
            const statsDiv = document.createElement('div');
            statsDiv.className = 'runner-stats';
            
            const lapsCount = document.createElement('span');
            lapsCount.textContent = `圈数: ${runner.laps.length}`;
            
            const totalTime = document.createElement('span');
            totalTime.textContent = `总时间: ${runner.laps.length > 0 ? this.formatTime(runner.laps[runner.laps.length - 1].time) : '00:00.00'}`;
            
            statsDiv.appendChild(lapsCount);
            statsDiv.appendChild(totalTime);
            
            headerDiv.appendChild(nameDiv);
            headerDiv.appendChild(statsDiv);
            
            // 操作按钮容器
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'runner-actions';
            
            // 添加一圈按钮
            const addButton = document.createElement('button');
            addButton.className = 'add-lap-btn';
            addButton.textContent = '记一圈';
            addButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.addLap(runner.id);
            });
            
            // 删除按钮
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.textContent = '删除';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteRunner(runner.id);
            });
            
            actionsDiv.appendChild(addButton);
            actionsDiv.appendChild(deleteButton);
            
            headerDiv.appendChild(actionsDiv);
            
            // 点击展开/收起详情
            headerDiv.addEventListener('click', () => {
                const lapsDiv = li.querySelector('.runner-laps');
                lapsDiv.classList.toggle('expanded');
            });
            
            li.appendChild(headerDiv);
            
            // 创建圈数详情部分
            const lapsDiv = document.createElement('div');
            lapsDiv.className = 'runner-laps';
            
            if (runner.laps.length > 0) {
                runner.laps.forEach(lap => {
                    const lapItem = document.createElement('div');
                    lapItem.className = 'lap-item';
                    lapItem.innerHTML = `
                        <span>第${lap.lap}圈</span>
                        <span class="lap-time">${this.formatTime(lap.duration)}</span>
                    `;
                    lapsDiv.appendChild(lapItem);
                });
            } else {
                const noLaps = document.createElement('div');
                noLaps.textContent = '暂无圈数记录';
                noLaps.style.color = '#6c757d';
                noLaps.style.fontStyle = 'italic';
                noLaps.style.textAlign = 'center';
                noLaps.style.padding = '15px';
                lapsDiv.appendChild(noLaps);
            }
            
            li.appendChild(lapsDiv);
            
            this.runnersList.appendChild(li);
        });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.runningTimer = new RunningTimer();
});