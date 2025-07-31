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
            expenses: [],
            newExpense: {
                type: 'shopping',
                description: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                receipt: null
            }
        }
    },
    computed: {
        totalAmount() {
            return this.expenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
        },
        shoppingTotal() {
            return this.expenses
                .filter(expense => expense.type === 'shopping')
                .reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
        },
        serviceTotal() {
            return this.expenses
                .filter(expense => expense.type === 'service')
                .reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
        },
        recentExpenses() {
            return this.expenses
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);
        }
    },
    methods: {
        async loadExpenses() {
            try {
                const snapshot = await db.collection('expenses').orderBy('date', 'desc').get();
                this.expenses = snapshot.docs.map(doc => ({
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

            const expense = {
                type: this.newExpense.type,
                description: this.newExpense.description,
                amount: parseFloat(this.newExpense.amount),
                date: this.newExpense.date,
                receipt: this.newExpense.receipt,
                createdAt: new Date()
            };

            try {
                await db.collection('expenses').add(expense);
                this.expenses.unshift(expense);
                this.resetForm();
                this.currentView = 'list';
                this.saveToLocalStorage();
            } catch (error) {
                console.error('Error adding expense:', error);
                // Fallback to localStorage
                expense.id = Date.now().toString();
                this.expenses.unshift(expense);
                this.resetForm();
                this.currentView = 'list';
                this.saveToLocalStorage();
            }
        },

        async deleteExpense(index) {
            const expense = this.expenses[index];
            if (confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
                try {
                    if (expense.id) {
                        await db.collection('expenses').doc(expense.id).delete();
                    }
                    this.expenses.splice(index, 1);
                    this.saveToLocalStorage();
                } catch (error) {
                    console.error('Error deleting expense:', error);
                    this.expenses.splice(index, 1);
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

        resetForm() {
            this.newExpense = {
                type: 'shopping',
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

        saveToLocalStorage() {
            localStorage.setItem('expenses', JSON.stringify(this.expenses));
        },

        loadFromLocalStorage() {
            const saved = localStorage.getItem('expenses');
            if (saved) {
                this.expenses = JSON.parse(saved);
            }
        }
    },
    mounted() {
        this.loadExpenses();
    }
}).mount('#app'); 