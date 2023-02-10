//加入規則 (CDN版本)
Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
        VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
});

//加入多國語系
VeeValidateI18n.loadLocaleFromURL('../zh_TW.json');

// Activate the locale
VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'),
    validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const apiUrl = "https://vue3-course-api.hexschool.io/v2/";
const apiPath = "hilda88";

//產品modal 元件
const productModal = {    
    props : ["id", "addToCart","openModal"], //接收外層傳入的產品id
    data() {
        return {
            modal : {},
            tempProduct : {},   //單一產品
            qty : 1,    //數量預設值
        }
    },
    template : "#userProductModal",
    watch : {  //監聽props 傳入的值
         // 當 id 變動時 取得單一產品API 開啟modal        
        id () {            
            if (this.id) {  //有id時 取得API                               
                axios.get(`${apiUrl}api/${apiPath}/product/${this.id}`)
                    .then(res => {                                          
                        this.tempProduct = res.data.product;  
                        this.modal.show();
                    })
                    .catch(err => {
                        alert(err.data.message);
                    })
            }    
        }
    },
    methods : {
        hide() {    //關閉modal
            this.modal.hide();
        },
    },
    mounted(){        
        this.modal = new bootstrap.Modal(this.$refs.modal);    
        // modal綁上監聽 modal關閉後要做....
        this.$refs.modal.addEventListener('hidden.bs.modal',  (event) => {
            this.openModal(""); // 清空id            
        });         
	}   
}

const app = Vue.createApp({
    data(){
		return{
            products : [], //產品列表
            productID : '', // 產品id
            cart : {},  //購物車
            loadingItem : "",   //存取id 讀取效果修正  阻擋過度讀取操作 
            form : {    //表單
                user: {
                    name: "",
                    email: "",
                    tel: "",
                    address: "",
                },
                message: ""                
            }, 
            isLoading : false,           
		}
	},
	// 方法集
	methods: {
        getProducts() { //取得全部產品列表
            axios.get(`${apiUrl}api/${apiPath}/products/all`)
                .then(res => {                    
                    this.products = res.data.products;      //將API資料 賦予到products陣列
                })
                .catch(err => {
                    alert(err.data.message);
                })

        },
        openModal(id){  //開啟產品modal時 取得產品id               
            this.productID = id;
        },
        addToCart(product_id, qty = 1) {    // 加入購物車
            this.isLoading = true;
            const data = {
                product_id,
                qty,
            };  
            axios.post(`${apiUrl}api/${apiPath}/cart`, { data })
                .then(res => {                                        
                    alert(res.data.message);
                    this.isLoading = false;                                       
                    this.$refs.productModal.hide(); // 加入成功後 執行元件的關閉modal
                    this.getCarts(); //重新取得購物車列表
                })
                .catch(err => {
                    alert(err.data.message);
                })
        },
        getCarts() { //取得購物車列表
            axios.get(`${apiUrl}api/${apiPath}/cart`)
                .then(res => {                    
                    this.cart = res.data.data;                     
                })
                .catch(err => {
                    alert(err.data.message);
                })
        },        
        updateCart(item) {   //更新購物車數量
            this.loadingItem = item.id; //抓id 觸發axios前 先存取
            const data = {
                "product_id" : item.product.id,
                "qty": item.qty
            }
            axios.put(`${apiUrl}api/${apiPath}/cart/${item.id}`, { data })
                .then(res => {                                  
                    alert(res.data.message);       
                    this.getCarts(); 
                    this.loadingItem = "";  //  結束時清空id                   
                })
                .catch(err => {
                    alert(err.data.message);
                })
        },
        deleteCartItem(item) {    //刪除購物車品項       
            this.loadingItem = item.id;     
            this.isLoading = true;             
            axios.delete(`${apiUrl}api/${apiPath}/cart/${item.id}`)
                .then(res => {                                    
                    alert(res.data.message);   
                    this.isLoading = false;                          
                    this.loadingItem = "";                            
                    this.getCarts(); 
                })
                .catch(err => {
                    alert(err.data.message);
                })
        },
        deleteCarts() {    //刪除全部購物車            
            axios.delete(`${apiUrl}api/${apiPath}/carts`)
                .then(() => {                                    
                    alert("已清空購物車");       
                    this.getCarts();
                })
                .catch(err => {
                    alert(err.data.message);
                })
        },
        isPhone(value) {    //驗證電話
            const phoneNumber = /^(09)[0-9]{8}$/
            return phoneNumber.test(value) ? true : '需要正確的電話號碼'
        },
        createOrder() {    // 結帳送出訂單
            const data = this.form;           
            if (this.cart.carts.length > 0) {      //判斷購物車有商品送出API          
                axios.post(`${apiUrl}api/${apiPath}/order`, { data })
                    .then((res) => {                                                        
                        alert("訂單已成立");       
                        this.getCarts(); 
                        this.$refs.form.resetForm(); // 表單清空  
                        this.form.message = "";                                 
                    })
                    .catch(err => {
                        alert(err.data.message);
                    })
            }else{
                alert("購物車不能空著哦");
            }
        },
        
	},
    // 元件
    components : {
        productModal,  
                   
    },
	// 生命週期
	mounted(){
        this.getProducts();  //執行產品列表
        this.getCarts();     //執行購物車列表
	}
});
// app.component('loading', VueLoading.Component);

app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);


app.mount("#app")