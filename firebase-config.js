// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyCV4zMfbBwY4jT_qiRLzIAa76dMMH7Ayng",
  authDomain: "coffeesalesdata.firebaseapp.com",
  projectId: "coffeesalesdata",
  storageBucket: "coffeesalesdata.firebasestorage.app",
  messagingSenderId: "678537310070",
  appId: "1:678537310070:web:9d455614e312cf9356d457",
  measurementId: "G-EQCE557XHD"
};

// 全局变量
let db = null;
let salesCollection = null;
let isInitialized = false;

// 初始化 Firebase
async function initializeFirebase() {
  if (isInitialized) {
    console.log('Firebase 已经初始化');
    return true;
  }

  try {
    console.log('开始初始化 Firebase...');
    
    // 检查 Firebase 模块是否已加载
    const modules = window.firebaseModules;
    if (!modules) {
      throw new Error('Firebase 模块未加载，请检查网络连接');
    }
    
    // 初始化应用
    const app = modules.initializeApp(firebaseConfig);
    console.log('Firebase 应用初始化成功');
    
    // 初始化 Firestore
    db = modules.getFirestore(app);
    console.log('Firestore 初始化成功');
    
    // 初始化集合引用
    salesCollection = modules.collection(db, 'salesData');
    console.log('销售数据集合已初始化');
    
    // 测试集合访问
    const testQuery = modules.query(salesCollection, modules.limit(1));
    await modules.getDocs(testQuery);
    console.log('集合访问测试成功');
    
    isInitialized = true;
    return true;
    
  } catch (error) {
    console.error('Firebase 初始化失败:', error);
    isInitialized = false;
    db = null;
    salesCollection = null;
    throw error;
  }
}

// 设置实时数据监听
function setupRealtimeListener(callback) {
  if (!isInitialized || !db || !salesCollection) {
    console.error('Firebase 未初始化');
    return null;
  }

  try {
    console.log('设置实时数据监听...');
    const modules = window.firebaseModules;
    
    const q = modules.query(salesCollection, modules.orderBy('date', 'desc'));
    return modules.onSnapshot(q,
      snapshot => {
        console.log('收到实时数据更新:', snapshot.size + '条记录');
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(data);
      },
      error => {
        console.error('实时数据监听错误:', error);
        showNotification('数据同步失败: ' + error.message, 'error');
      }
    );
  } catch (error) {
    console.error('设置数据监听失败:', error);
    showNotification('无法设置数据监听: ' + error.message, 'error');
    return null;
  }
}

// 获取所有销售数据
async function fetchSalesData() {
  try {
    if (!isInitialized || !db || !salesCollection) {
      throw new Error('Firebase未初始化');
    }
    
    const modules = window.firebaseModules;
    const q = modules.query(salesCollection, modules.orderBy('date', 'desc'));
    const snapshot = await modules.getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('获取数据失败:', error);
    showNotification('获取数据失败: ' + error.message, 'error');
    return [];
  }
}

// 添加销售记录
async function addSalesRecord(record) {
  try {
    if (!isInitialized || !db || !salesCollection) {
      throw new Error('Firebase未初始化');
    }
    
    const modules = window.firebaseModules;
    const docRef = await modules.addDoc(salesCollection, record);
    showNotification('数据添加成功！');
    return docRef.id;
  } catch (error) {
    console.error('添加数据失败:', error);
    showNotification('添加数据失败: ' + error.message, 'error');
    return null;
  }
}

// 更新销售记录
async function updateSalesRecord(id, updatedRecord) {
  try {
    if (!isInitialized || !db || !salesCollection) {
      throw new Error('Firebase未初始化');
    }
    
    const modules = window.firebaseModules;
    const docRef = modules.doc(db, 'salesData', id);
    await modules.updateDoc(docRef, updatedRecord);
    showNotification('数据更新成功！');
    return true;
  } catch (error) {
    console.error('更新数据失败:', error);
    showNotification('更新数据失败: ' + error.message, 'error');
    return false;
  }
}

// 删除销售记录
async function deleteSalesRecord(id) {
  try {
    if (!isInitialized || !db || !salesCollection) {
      throw new Error('Firebase未初始化');
    }
    
    const modules = window.firebaseModules;
    const docRef = modules.doc(db, 'salesData', id);
    await modules.deleteDoc(docRef);
    showNotification('数据删除成功！');
    return true;
  } catch (error) {
    console.error('删除数据失败:', error);
    showNotification('删除数据失败: ' + error.message, 'error');
    return false;
  }
}

// 显示通知
function showNotification(message, type = 'info') {
  console.log(`[通知 - ${type}]:`, message);
  
  if (typeof window.appShowNotification === 'function') {
    window.appShowNotification(message, type);
    return;
  }
  
  if (type === 'error') {
    alert('错误: ' + message);
  }
}

// 初始化应用
window.addEventListener('load', async () => {
  console.log('页面加载完成，开始初始化 Firebase...');
  try {
    await initializeFirebase();
    console.log('Firebase 初始化成功');
  } catch (error) {
    console.error('Firebase 初始化失败:', error);
    if (typeof window.appShowNotification === 'function') {
      window.appShowNotification('初始化失败: ' + error.message, 'error');
    }
  }
});

// 导出所需的函数
window.initializeFirebase = initializeFirebase;
window.setupRealtimeListener = setupRealtimeListener;
window.addSalesRecord = addSalesRecord;
window.updateSalesRecord = updateSalesRecord;
window.deleteSalesRecord = deleteSalesRecord;
window.fetchSalesData = fetchSalesData; 