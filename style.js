const baseUrl = 'https://livejs-api.hexschool.io';
const apiPath = 'weiweirobot'
const customerApi = `${baseUrl}/api/livejs/v1/customer/${apiPath}`

// https://livejs-api.hexschool.io/api/livejs/v1/customer/weiweirobot/products

// 初始化
function init(){
    getProduct();
    getCart();
}
init()

// 取得產品資料>渲染產品>選單篩選
// 取得產品資料
let productData = [];
function getProduct(){
    axios.get(`${customerApi}/products`)
    .then((res) => {
        // console.log(res);
        productData = res.data.products;
        renderProduct(productData);
    
    })
    .catch((err) => {
        console.log(err);
    })
}

// 渲染產品
const productWrap = document.querySelector('.productWrap');
function renderProduct(data){
    let str = '';
    data.forEach(item => {
        str += `<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${item.images}" alt="">
                <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${item.price}</p>
            </li>`;
    })
    productWrap.innerHTML = str;
}

// 選單篩選
const productSelect = document.querySelector('.productSelect');
productSelect.addEventListener('change', () => {
    // console.log(productSelect.value);
    filterProduct();
})

function filterProduct(){
    if (productSelect.value === '全部'){
        filterProductData = productData;
        
    }else{
        filterProductData = productData.filter(item => item.category.includes(productSelect.value));
    }
    renderProduct(filterProductData);
}

// 取得購物車資料>渲染購物車>加入購物車>渲染購物車
// 取得購物車資料
let cartData = [];
let finalTotal = 0;
function getCart(){
    axios.get(`${customerApi}/carts`)
    .then((res) => {
        // console.log(res);
        cartData = res.data.carts;
        finalTotal = res.data.finalTotal;
        renderCart();
    
    })
    .catch((err) => {
        console.log(err);
    })
}

// 加入購物車
productWrap.addEventListener('click', (e) => {
    e.preventDefault();
    // console.log(e.target)
    // console.log(e.target.classList.contains('addCardBtn'))
    if (e.target.classList.contains('addCardBtn')){
        // console.log(e.target.dataset.id)
        addCart(e.target.dataset.id);
    }
})
function addCart(id){
    const data = {
        "data": {
          "productId": id,
          "quantity": 1
        }
      }
      axios.post(`${customerApi}/carts`, data)
      .then((res) => {
        //   console.log(res);
          cartData = res.data.carts;
          finalTotal = res.data.finalTotal;
          renderCart()
      })
      .catch((err) => {
          console.log(err);
      })
}

// 渲染購物車
const shoppingCartTableBody = document.querySelector('.shoppingCart-table tbody');

function renderCart(){
    if (cartData.length === 0){
        shoppingCartTableBody.innerHTML = '目前購物車無任何品項';
        shoppingCartTableFoot.innerHTML = '';
        return;
    }

    let str = '';
    cartData.forEach(item => {
        str += `<tr data-id="${item.id}">
                        <td>
                            <div class="cardItem-title">
                                <img src="${item.product.images}" alt="">
                                <p>${item.product.title}</p>
                            </div>
                        </td>
                        <td>NT$${item.product.price}</td>
                        <td>
                            <button type="button" class="minBtn"> - </button> ${item.quantity} 
                            <button type="button" class="addBtn"> + </button>
                        </td>
                        <td>NT$${item.quantity * item.product.price}</td>
                        <td class="discardBtn">
                            <a href="#" class="material-icons discardBtnX">
                                clear
                            </a>
                        </td>
                    </tr>`;
    })
    shoppingCartTableBody.innerHTML = str;

    shoppingCartTableFoot.innerHTML = `<tr>
                        <td>
                            <a href="#" class="discardAllBtn">刪除所有品項</a>
                        </td>
                        <td></td>
                        <td></td>
                        <td>
                            <p>總金額</p>
                        </td>
                        <td>NT$${finalTotal}</td>
                    </tr>`;
}

// 刪除品項>單一、所有>渲染購物車
// 刪除所有品項>渲染購物車
const shoppingCartTableFoot = document.querySelector('.shoppingCart-table tfoot');
// const discardAllBtn = document.querySelector('.discardAllBtn');
shoppingCartTableFoot.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('discardAllBtn')){
        deleteCart(); // "購物車產品已全部清空。
    }
})

function deleteCart(){
    axios.delete(`${customerApi}/carts`)
    .then((res) => {
        // console.log(res);
        cartData = res.data.carts;
        finalTotal = res.data.finalTotal;
        renderCart();
    
    })
    .catch((err) => {
        console.log(err);
    })
}

shoppingCartTableBody.addEventListener('click', (e) => {
    // 刪除單一品項>渲染購物車
    e.preventDefault();
    // console.log(e.target.classList.contains('discardBtnX'))
    if (e.target.classList.contains('discardBtnX')){
        const Id = e.target.closest('tr').dataset.id;
        deleteIdCart(Id);
    }


    if (e.target.classList.contains('addBtn') || e.target.classList.contains('minBtn')){
        
        const Id = e.target.closest('tr').dataset.id;

        // 找到對應的商品
        productDataQty = cartData.find(item => item.id === Id);
        let qty = productDataQty.quantity;

        if (e.target.classList.contains('addBtn')){
            qty += 1;
        }

        if (e.target.classList.contains('minBtn')){
            qty -= 1;
            if (qty < 1){
                deleteIdCart(Id);
                return;
            }
        }
        updateCart(Id, qty)
    }
})
function deleteIdCart(id){
    axios.delete(`${customerApi}/carts/${id}`)
    .then((res) => {
        // console.log(res);
        cartData = res.data.carts;
        finalTotal = res.data.finalTotal;
        renderCart();
    
    })
    .catch((err) => {
        console.log(err);
    })
}

// 加入 - + 按鈕
function updateCart(id, qty){
    const data = {
        "data": {
          "id": id,
          "quantity": qty
        }
      };
    axios.patch(`${customerApi}/carts`, data)
    .then((res) => {
        // console.log(res);
        cartData = res.data.carts;
        finalTotal = res.data.finalTotal;
        renderCart();
    
    })
    .catch((err) => {
        console.log(err);
    })
}

// 送出購買訂單>表單驗證validate>清空購物車
const orderInfoForm = document.querySelector('.orderInfo-form');
const orderInfoBtn = document.querySelector('.orderInfo-btn');
orderInfoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sendOrder();
})

// 送出購買訂單>清空購物車
const customerName = document.querySelector('#customerName');
const customerPhone = document.querySelector('#customerPhone');
const customerEmail = document.querySelector('#customerEmail');
const customerAddress = document.querySelector('#customerAddress');
const tradeWay = document.querySelector('#tradeWay');
tradeWay.addEventListener('change', () => {
})

function sendOrder(){
    if (cartData.length === 0){
        alert('目前購物車無任何品項');
        return;
    }
    if (checkForm()){
        return;
    }
    const data = {
        "data": {
          "user": {
            "name": customerName.value.trim(),
            "tel": customerPhone.value.trim(),
            "email": customerEmail.value.trim(),
            "address": customerAddress.value.trim(),
            "payment": tradeWay.value
          }
        }
    }
    axios.post(`${customerApi}/orders`, data)
    .then((res) => {
        console.log(res);
        alert('已送出預訂資料');
        cartData = [];
        renderCart();
        orderInfoForm.reset();
    })
    .catch((err) => {
        console.log(err);
    })
}

// 表單驗證
function checkForm(){
    const constraints = {
        姓名: {
            presence: { message: "^必填" },
        },
        電話: {
            presence: { message: "^必填" },
        },
        Email: {
            presence: { message: "^必填" },
            email: { message: "^請輸入正確的信箱格式" },
        },
        寄送地址: {
            presence: { message: "^必填" },
        },
    };

    const error = validate(orderInfoForm, constraints);
    // console.log(error);
    if (error) {
        // 將錯誤訊息以 alert 顯示
        let errorMessages = '';
        for (const field in error){
            errorMessages += `${field}: 必填!\n`
        }
        alert(`必填欄位需填寫:\n${errorMessages}`)
    }
    return error ? true : false;
}