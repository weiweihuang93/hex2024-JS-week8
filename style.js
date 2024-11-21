const baseUrl = 'https://livejs-api.hexschool.io';
const apiPath = 'weiweirobot'
const customerApi = `${baseUrl}/api/livejs/v1/customer/${apiPath}`

// https://livejs-api.hexschool.io/api/livejs/v1/customer/weiweirobot/products

// 初始化
function init(){
    getProduct();
}
init()

// 取得產品資料>渲染產品>選單篩選

// 取得產品資料
let productData = [];
function getProduct(){
    axios.get(`${customerApi}/products`)
    .then((res) => {
        console.log(res);
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
                <a href="#" class="addCardBtn">加入購物車</a>
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

// 取得購物車資料>渲染購物車
//     加入購物車
//     刪除品項>單一、所有