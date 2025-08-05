// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAfp5qCdFiNSrSCIYLmWS2kqe3xdkvVXs4",
    authDomain: "blackfitness-5f727.firebaseapp.com",
    projectId: "blackfitness-5f727",
    storageBucket: "blackfitness-5f727.firebasestorage.app",
    messagingSenderId: "86036027396",
    appId: "1:86036027396:web:b685645ad6fa711c34fd51",
    measurementId: "G-5V9J8ZFZHY"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Vue App
const { createApp } = Vue;

createApp({
    data() {
        return {
            currentView: 'list',
            selectedCategory: 'all',
            expenses: [],
            newExpense: {
                fundType: 'petty-cash',
                category: '',
                description: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                receipt: null
            },
            pettyCashQuota: 20000, // โควต้า Petty Cash 20,000 บาท
            showReceiptModal: false,
            selectedReceipt: null,
            currentMonth: new Date().getFullYear() * 100 + new Date().getMonth() + 1, // YYYYMM format
            allExpenses: [] // เก็บข้อมูลทั้งหมดสำหรับประวัติ
        }
    },
    computed: {
        // Current month display
        currentMonthDisplay() {
            const year = Math.floor(this.currentMonth / 100);
            const month = this.currentMonth % 100;
            const date = new Date(year, month - 1);
            return date.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long'
            });
        },

        // Navigation controls
        canGoPrevious() {
            const currentDate = new Date();
            const currentYearMonth = currentDate.getFullYear() * 100 + currentDate.getMonth() + 1;
            return this.currentMonth > currentYearMonth - 12; // จำกัดย้อนหลัง 12 เดือน
        },

        canGoNext() {
            const currentDate = new Date();
            const currentYearMonth = currentDate.getFullYear() * 100 + currentDate.getMonth() + 1;
            return this.currentMonth < currentYearMonth;
        },

        // Filter expenses by current month
        currentMonthExpenses() {
            const year = Math.floor(this.currentMonth / 100);
            const month = this.currentMonth % 100;
            return this.allExpenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getFullYear() === year && expenseDate.getMonth() === month - 1;
            });
        },

        // Petty Cash calculations for current month
        pettyCashExpenses() {
            return this.currentMonthExpenses.filter(expense => expense.fundType === 'petty-cash');
        },
        pettyCashTotal() {
            return this.pettyCashExpenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
        },
        pettyCashUsed() {
            return this.pettyCashTotal;
        },
        pettyCashRemaining() {
            return Math.max(0, this.pettyCashQuota - this.pettyCashUsed);
        },
        pettyCashPercentage() {
            return Math.round((this.pettyCashUsed / this.pettyCashQuota) * 100);
        },
        pettyCashProgress() {
            const circumference = 2 * Math.PI * 52; // r = 52
            const progress = (this.pettyCashUsed / this.pettyCashQuota) * circumference;
            return `${progress} ${circumference}`;
        },

        // Fitness calculations for current month
        fitnessExpenses() {
            return this.currentMonthExpenses.filter(expense => expense.fundType === 'fitness');
        },
        fitnessTotal() {
            return this.fitnessExpenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
        },

        // Cafe calculations for current month
        cafeExpenses() {
            return this.currentMonthExpenses.filter(expense => expense.fundType === 'cafe');
        },
        cafeTotal() {
            return this.cafeExpenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
        },

        // Total calculations for current month
        totalAmount() {
            return this.currentMonthExpenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
        },

        // Filtered expenses based on selected category for current month
        filteredExpenses() {
            if (this.selectedCategory === 'all') {
                return this.currentMonthExpenses;
            }
            return this.currentMonthExpenses.filter(expense => expense.fundType === this.selectedCategory);
        },

        // Recent expenses for summary (current month)
        recentExpenses() {
            return this.currentMonthExpenses
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);
        },

        // Monthly history for historical view
        monthlyHistory() {
            const months = {};
            
            this.allExpenses.forEach(expense => {
                const date = new Date(expense.date);
                const yearMonth = date.getFullYear() * 100 + date.getMonth() + 1;
                
                if (!months[yearMonth]) {
                    months[yearMonth] = {
                        monthDisplay: date.toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long'
                        }),
                        pettyCash: 0,
                        fitness: 0,
                        cafe: 0,
                        total: 0,
                        count: 0
                    };
                }
                
                const amount = parseFloat(expense.amount || 0);
                months[yearMonth].total += amount;
                months[yearMonth].count += 1;
                
                switch (expense.fundType) {
                    case 'petty-cash':
                        months[yearMonth].pettyCash += amount;
                        break;
                    case 'fitness':
                        months[yearMonth].fitness += amount;
                        break;
                    case 'cafe':
                        months[yearMonth].cafe += amount;
                        break;
                }
            });
            
            return Object.keys(months)
                .sort((a, b) => parseInt(b) - parseInt(a)) // เรียงจากใหม่ไปเก่า
                .map(key => months[key]);
        }
    },
    methods: {
        async loadExpenses() {
            try {
                const snapshot = await db.collection('expenses').orderBy('date', 'desc').get();
                this.allExpenses = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (error) {
                console.error('Error loading expenses:', error);
                // Fallback to localStorage if Firebase fails
                this.loadFromLocalStorage();
            }
        },
        
        async addExpense() {
            if (!this.newExpense.description || !this.newExpense.amount) {
                alert('กรุณากรอกข้อมูลให้ครบถ้วน');
                return;
            }

            // Check Petty Cash quota
            if (this.newExpense.fundType === 'petty-cash') {
                const amount = parseFloat(this.newExpense.amount);
                if (this.pettyCashRemaining < amount) {
                    alert(`Petty Cash เหลือเพียง ฿${this.formatNumber(this.pettyCashRemaining)} ไม่สามารถเบิกได้`);
                    return;
                }
            }

            const expense = {
                fundType: this.newExpense.fundType,
                category: this.newExpense.category,
                description: this.newExpense.description,
                amount: parseFloat(this.newExpense.amount),
                date: this.newExpense.date,
                receipt: this.newExpense.receipt,
                createdAt: new Date()
            };

            try {
                await db.collection('expenses').add(expense);
                this.allExpenses.unshift(expense);
                this.resetForm();
                this.currentView = 'list';
                this.saveToLocalStorage();
            } catch (error) {
                console.error('Error adding expense:', error);
                // Fallback to localStorage
                expense.id = Date.now().toString();
                this.allExpenses.unshift(expense);
                this.resetForm();
                this.currentView = 'list';
                this.saveToLocalStorage();
            }
        },

        async deleteExpense(index) {
            const expense = this.currentMonthExpenses[index];
            if (confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
                try {
                    if (expense.id) {
                        await db.collection('expenses').doc(expense.id).delete();
                    }
                    const allIndex = this.allExpenses.findIndex(e => e.id === expense.id);
                    if (allIndex !== -1) {
                        this.allExpenses.splice(allIndex, 1);
                    }
                    this.saveToLocalStorage();
                } catch (error) {
                    console.error('Error deleting expense:', error);
                    const allIndex = this.allExpenses.findIndex(e => e.id === expense.id);
                    if (allIndex !== -1) {
                        this.allExpenses.splice(allIndex, 1);
                    }
                    this.saveToLocalStorage();
                }
            }
        },

        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.newExpense.receipt = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        },

        // Month navigation methods
        previousMonth() {
            if (this.canGoPrevious) {
                const year = Math.floor(this.currentMonth / 100);
                const month = this.currentMonth % 100;
                if (month === 1) {
                    this.currentMonth = (year - 1) * 100 + 12;
                } else {
                    this.currentMonth = year * 100 + (month - 1);
                }
            }
        },

        nextMonth() {
            if (this.canGoNext) {
                const year = Math.floor(this.currentMonth / 100);
                const month = this.currentMonth % 100;
                if (month === 12) {
                    this.currentMonth = (year + 1) * 100 + 1;
                } else {
                    this.currentMonth = year * 100 + (month + 1);
                }
            }
        },

        goToCurrentMonth() {
            const currentDate = new Date();
            this.currentMonth = currentDate.getFullYear() * 100 + currentDate.getMonth() + 1;
        },

        // Receipt modal functions
        viewReceipt(receiptUrl) {
            this.selectedReceipt = receiptUrl;
            this.showReceiptModal = true;
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        },

        closeReceiptModal() {
            this.showReceiptModal = false;
            this.selectedReceipt = null;
            // Restore body scroll
            document.body.style.overflow = 'auto';
        },

        resetForm() {
            this.newExpense = {
                fundType: 'petty-cash',
                category: '',
                description: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                receipt: null
            };
        },

        formatNumber(num) {
            return num.toLocaleString('th-TH');
        },

        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },

        // Fund type helpers
        getFundIcon(fundType) {
            const icons = {
                'petty-cash': 'fas fa-coins',
                'fitness': 'fas fa-dumbbell',
                'cafe': 'fas fa-coffee'
            };
            return icons[fundType] || 'fas fa-money-bill';
        },

        getFundLabel(fundType) {
            const labels = {
                'petty-cash': 'Petty Cash',
                'fitness': 'Fitness',
                'cafe': 'Cafe'
            };
            return labels[fundType] || fundType;
        },

        getCategoryLabel(category) {
            const labels = {
                'office': 'สำนักงาน',
                'maintenance': 'ซ่อมบำรุง',
                'supplies': 'วัสดุสิ้นเปลือง',
                'equipment': 'อุปกรณ์',
                'supplements': 'อาหารเสริม',
                'training': 'คอร์สฝึก',
                'ingredients': 'วัตถุดิบ',
                'decoration': 'ตกแต่ง'
            };
            return labels[category] || category;
        },

        getAmountColor(fundType) {
            const colors = {
                'petty-cash': 'text-success',
                'fitness': 'text-warning',
                'cafe': 'text-info'
            };
            return colors[fundType] || 'text-primary';
        },

        getFundBadgeClass(fundType) {
            const classes = {
                'petty-cash': 'badge bg-success',
                'fitness': 'badge bg-warning',
                'cafe': 'badge bg-info'
            };
            return classes[fundType] || 'badge bg-secondary';
        },

        saveToLocalStorage() {
            localStorage.setItem('expenses', JSON.stringify(this.allExpenses));
        },

        loadFromLocalStorage() {
            const saved = localStorage.getItem('expenses');
            if (saved) {
                this.allExpenses = JSON.parse(saved);
            }
        }
    },
    mounted() {
        this.loadExpenses();
    }
}).mount('#app'); 