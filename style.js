// 初始化
function init(){
    getProduct();
    getCart();
}
init()

// 取得產品資料>渲染產品>選單篩選
// 取得產品資料
let productData = [];
let product
function getProduct(){
    axios.get(`${customerApi}/products`)
    .then((res) => {
        productData = res.data.products;
        renderProduct(productData);
    
    })
    .catch((err) => {
        console.log('getProduct', err);
    })
}

// 渲染產品
const productWrap = document.querySelector('.productWrap');
function renderProduct(data){
    let str = '';
    data.forEach(item => {

        // 判斷商品是否已經加入購物車，為它將上disabled
        const isDisabled = cartProductId.includes(item.id);

        str += `<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${item.images}" alt="">
                <a href="#" class="addCardBtn ${isDisabled ? 'disabled' : ''}" data-id="${item.id}" ${isDisabled ? 'disabled' : ''}>加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${formatNumber(item.origin_price)}</del>
                <p class="nowPrice">NT$${formatNumber(item.price)}</p>
            </li>`;
    })
    productWrap.innerHTML = str;
}

// 選單篩選
const productSelect = document.querySelector('.productSelect');
productSelect.addEventListener('change', () => {
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
let cartProductId = []; // 已加入購物車商品的 ID
let finalTotal = 0;
function getCart(){
    axios.get(`${customerApi}/carts`)
    .then((res) => {
        cartData = res.data.carts;
        finalTotal = res.data.finalTotal;
        
        cartProductId = cartData.map(item => item.product.id); //
        renderProduct(productData);  // 重新渲染產品資料，更新按鈕狀態
        renderCart();
    
    })
    .catch((err) => {
        console.log('getCart', err);
    })
}

// 加入購物車
productWrap.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('addCardBtn') && !e.target.classList.contains('disabled')) {
        // 加入購物車時disabled
        e.target.classList.add('disabled');
        e.target.setAttribute('disabled', 'true');
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
          cartData = res.data.carts;
          finalTotal = res.data.finalTotal;

          cartProductId = cartData.map(item => item.product.id); //
          renderProduct(productData);  // 重新渲染產品資料，更新按鈕狀態
          
          renderCart();

        // sweetalert2
        Swal.fire("成功加入購物車!");
      })
      .catch((err) => {
          console.log('addCart', err);
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
                        <td>NT$${formatNumber(item.product.price)}</td>
                        <td>
                            <button type="button" class="minBtn"> - </button> ${item.quantity} 
                            <button type="button" class="addBtn"> + </button>
                        </td>
                        <td>NT$${formatNumber(item.quantity * item.product.price)}</td>
                        <td class="discardBtn">
                            <a href="#" class="material-icons discardBtnX" data-id="${item.product.id}">
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
                        <td>NT$${formatNumber(finalTotal)}</td>
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
    // sweetalert2
    Swal.fire({
        title: "確定要刪除所有品項嗎?",
        text: "((((；゜Д゜)))",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "取消刪除",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "確認刪除"
      }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(`${customerApi}/carts`)
            .then((res) => {
                cartData = res.data.carts;
                finalTotal = res.data.finalTotal;
                renderCart();

                // 清空購物車後，恢復所有商品的加入購物車按鈕
                const addCardBtnAll = document.querySelectorAll('.addCardBtn');
                addCardBtnAll.forEach(btn => {
                    btn.classList.remove('disabled');
                    btn.removeAttribute('disabled');
                });
    
                Swal.fire({
                    title: "已刪除！",
                    text: "您的購物車已清空。",
                    icon: "success"
                });
            })
            .catch((err) => {
                console.log('deleteCart', err);
            });
    }
})
}

shoppingCartTableBody.addEventListener('click', (e) => {
    // 刪除單一品項>渲染購物車
    e.preventDefault();
    if (e.target.classList.contains('discardBtnX')){
        const cartId = e.target.closest('tr').dataset.id;
        deleteIdCart(cartId);

        // 移除單一品項後，恢復商品的加入購物車按鈕
        const productId = e.target.dataset.id;
        toDisabledBtn(productId);
    }


    if (e.target.classList.contains('addBtn') || e.target.classList.contains('minBtn')){
        
        const cartId = e.target.closest('tr').dataset.id;
        // 移除單一品項後，恢復商品的加入購物車按鈕
        const productId = e.target.closest('tr').querySelector('.discardBtnX').dataset.id;

        // 找到對應的商品
        const productDataQty = cartData.find(item => item.id === cartId);
        let qty = productDataQty.quantity;

        if (e.target.classList.contains('addBtn')){
            qty += 1;
        }

        if (e.target.classList.contains('minBtn')){
            qty -= 1;
            if (qty < 1){
                deleteIdCart(cartId);
                toDisabledBtn(productId);
                return;
            }
        }
        updateCart(cartId, qty)
    }
})
function deleteIdCart(id){
    axios.delete(`${customerApi}/carts/${id}`)
    .then((res) => {
        cartData = res.data.carts;
        finalTotal = res.data.finalTotal;
        renderCart();

        // sweetalert2
        Swal.fire("已移除品項!");
    
    })
    .catch((err) => {
        console.log('deleteIdCart', err);
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
        cartData = res.data.carts;
        finalTotal = res.data.finalTotal;
        renderCart();
    
    })
    .catch((err) => {
        console.log('updateCart', err);
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
        // alert('已送出預訂資料');
        // sweetalert2
        Swal.fire("已送出預訂資料!");
        cartData = [];
        renderCart();
        orderInfoForm.reset();

        // 清空購物車後，恢復所有商品的加入購物車按鈕
        const addCardBtnAll = document.querySelectorAll('.addCardBtn');
        addCardBtnAll.forEach(btn => {
            btn.classList.remove('disabled');
            btn.removeAttribute('disabled');
        });
    })
    .catch((err) => {
        console.log('sendOrder', err);
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
    if (error) {
        // 將錯誤訊息以 alert 顯示
        let errorMessages = '';
        for (const field in error){
            errorMessages += `${field}: <span style="color: #C72424">必填!</span>\n`;
        }
        // alert(`必填欄位需填寫:\n${errorMessages}`)
        // sweetalert2
        Swal.fire(`必填欄位需填寫:\n${errorMessages}`);
    }
    return error ? true : false;
}

// 移除單一品項後，恢復商品的加入購物車按鈕
function toDisabledBtn(id){
    const addCardBtnAll = document.querySelectorAll('.addCardBtn');
    addCardBtnAll.forEach(btn => {
        if (btn.dataset.id === id){
            btn.classList.remove('disabled');
            btn.removeAttribute('disabled');
        }
    });
}

// 千位分隔符
function formatNumber(number) {
    let parts = number.toString().split('.'); // 分割整數和小數部分
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 格式化整數部分
    return parts.length > 1 ? parts.join('.') : parts[0]; // 拼接小數部分
}