// 初始化
function init(){
    getOrder();
}
init();

// 取得訂單資料>渲染訂單資料
// 取得訂單資料
let orderData = [];
function getOrder(){
    axios.get(`${adminApi}/orders`, {
        headers:{
            authorization: token
        }
    })
    .then((res) => {
        orderData = res.data.orders;

        // 排序訂單日期
        orderData.sort((a,b) => b.createdAt - a.createdAt);

        renderOrder();
        // / 在渲染訂單後再取得並顯示圖表 預設顯示類別圖表
        calcProductCategory();
    })
    .catch((err) => {
        console.log('getOrder', err);
    })
}

// 渲染訂單資料
const orderPageTableBody = document.querySelector('.orderPage-table tbody');
function renderOrder(){
    let str = '';
    orderData.forEach(order => {

        //遍歷products
        let orderProducts = '';
        order.products.forEach(product => {
            orderProducts += `<p>${product.title}</p> x ${product.quantity}`
        })

        // 更新訂單狀態 在CSS設定顏色樣式
        const statusClass = order.paid ? 'status-processed' : 'status-unprocessed';

        str += `<tr data-id="${order.id}">
                    <td>${order.id}</td>
                    <td>
                      <p>${order.user.name}</p>
                      <p>${order.user.tel}</p>
                    </td>
                    <td>${order.user.address}</td>
                    <td>${order.user.email}</td>
                    <td>
                      <p>${orderProducts}</p>
                    </td>
                    <td>${formatTime(order.createdAt)}</td>
                    <td class="orderStatus">
                      <a href="#" class="orderStatus-link ${statusClass}">${order.paid ? '已處理': '未處理'}</a>
                    </td>
                    <td>
                      <input type="button" class="delSingleOrder-Btn" value="刪除">
                    </td>
                </tr>`;
    })
    orderPageTableBody.innerHTML = str;
}

orderPageTableBody.addEventListener('click', (e) => {
    e.preventDefault();
    const id = e.target.closest('tr').dataset.id;
    // 清除訂單>單一、全部訂單>渲染訂單資料
    if (e.target.classList.contains('delSingleOrder-Btn')){
        deleteIdOrder(id);
    }
    
    if (e.target.classList.contains('orderStatus-link')){
        updateOrderStatus(id);
    }
})

// 清除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', (e) => {
    e.preventDefault();
    deleteAllOrder();
})

function deleteAllOrder(){
    axios.delete(`${adminApi}/orders`, {
        headers:{
            authorization: token
        }
    })
    .then((res) => {
        orderData = res.data.orders;
        renderOrder();

        // 刪除訂單後，重新渲染圖表
        calcProductCategory();  // 更新圖表
        calcProductTitle(); // 更新圖表
    })
    .catch((err) => {
        console.log('deleteAllOrder', err);
    })
}

// 清除單筆訂單
function deleteIdOrder(id){
    axios.delete(`${adminApi}/orders/${id}`, {
        headers:{
            authorization: token
        }
    })
    .then((res) => {
        orderData = res.data.orders;

        // 排序訂單日期
        orderData.sort((a,b) => b.createdAt - a.createdAt);
        renderOrder();

        // 刪除訂單後，重新渲染圖表
        calcProductCategory();  // 更新圖表
        calcProductTitle(); // 更新圖表
    })
    .catch((err) => {
        console.log('deleteIdOrder', err);
    })
}

// 時間格式化
function formatTime(timestamp){
    const time = new Date(timestamp * 1000)
    return time.toLocaleString('zh-TW', {
        hour12: false
    })
}

// 更新訂單狀態
function updateOrderStatus(id){
    // 查找對應的訂單
    const resultOrderStatus = orderData.find(order => order.id === id);
    const data = {
        "data": {
          "id": id,
          "paid": !resultOrderStatus.paid,
        }
      }
    axios.put(`${adminApi}/orders`,data, {
        headers:{
            authorization: token
        }
    })
    .then((res) => {
        orderData = res.data.orders;
        // 在更新後重新排序
        orderData.sort((a, b) => b.createdAt - a.createdAt);
        renderOrder();
    })
    .catch((err) => {
        console.log('updateOrderStatus', err);
    })
}

const sectionTitle = document.querySelector('.section-title');
const productRevenueBtn = document.querySelector('#productRevenueBtn');
const categoryRevenueBtn = document.querySelector('#categoryRevenueBtn');
productRevenueBtn.addEventListener('click', () => {
    calcProductTitle();
    sectionTitle.textContent = '全品項營收比重';
})
categoryRevenueBtn.addEventListener('click', () => {
    calcProductCategory();
    sectionTitle.textContent = '全產品類別營收比重';
})

// 圖表呈現>全品項營收比重、全產品類別營收比重(共有：床架、收納、窗簾)
function calcProductCategory(){
    const revenueResultObj = {};
    orderData.forEach(order => {
        order.products.forEach(product => {
            if (revenueResultObj[product.category] === undefined){
                revenueResultObj[product.category] = product.price * product.quantity;
            }else{
                revenueResultObj[product.category] += product.price * product.quantity;
            }
        })
    })
    renderChart(Object.entries(revenueResultObj));
}

// 全品項營收比重，排序並找出前三筆 其他統整為「其它」
function calcProductTitle(){
    const revenueResultObj = {};
    orderData.forEach(order => {
        order.products.forEach(product => {
            if (revenueResultObj[product.title] === undefined){
                revenueResultObj[product.title] = product.price * product.quantity;
            }else{
                revenueResultObj[product.title] += product.price * product.quantity;
            }
        })
    })
    // return Object.entries(revenueResultObj);
    // renderChart(Object.entries(revenueResultObj));

    // 排序並找出前三筆 其他統整為「其它」
    const resultArr = Object.entries(revenueResultObj);
    const sortResultArr = resultArr.sort((a,b) => b[1] - a[1]);
    const rankOfThree = [];
    let otherTotal = 0;
    sortResultArr.forEach((product, index) => {
        if (index <= 2){
            rankOfThree.push(product);
        }
        if (index > 2){
            otherTotal += product[1];
        }
    })
    if (sortResultArr.length > 3){
        rankOfThree.push(['其他', otherTotal]);
    }
    renderChart(rankOfThree);
} 

// C3.js
function renderChart(data){
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        color: {
            pattern: ['#DACBFF', '#9D7FEA', '#5434A7', '#301E5F']
        },
        data: {
            type: "pie",
            columns: data,
            // colors:{
            //     "Louvre 雙人床架":"#DACBFF",
            //     "Antony 雙人床架":"#9D7FEA",
            //     "Anty 雙人床架": "#5434A7",
            //     "其他": "#301E5F",
            // }
        },
    });
}