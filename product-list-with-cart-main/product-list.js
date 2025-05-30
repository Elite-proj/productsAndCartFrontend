document.addEventListener("DOMContentLoaded", function () {
  const data = new Promise((resolve, reject) => {
    fetch("./data.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`error: ${response.status}`);
        }
        return response.json();
      })
      .then((jsonData) => {
        resolve(jsonData);
      })
      .catch((error) => {
        reject(error);
      });
  });

  const productGrid = document.querySelector(".products-grid");
  var productsList = [];
  var cart = [];
  if (productGrid) {
    data
      .then((product) => {
        productsList = product;

        const productItemHTML = product
          .map((item) => {
            return `<div class="product-item">
            <div class="product-image-container">
              <img class="product-image" src=${item.image.desktop} />
              <div class="cart-btn-container">
                <button class="add-to-cart-btn"><i><svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" fill="none" viewBox="0 0 21 20"><g fill="#C73B0F" clip-path="url(#a)"><path d="M6.583 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM15.334 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM3.446 1.752a.625.625 0 0 0-.613-.502h-2.5V2.5h1.988l2.4 11.998a.625.625 0 0 0 .612.502h11.25v-1.25H5.847l-.5-2.5h11.238a.625.625 0 0 0 .61-.49l1.417-6.385h-1.28L16.083 10H5.096l-1.65-8.248Z"/><path d="M11.584 3.75v-2.5h-1.25v2.5h-2.5V5h2.5v2.5h1.25V5h2.5V3.75h-2.5Z"/></g><defs><clipPath id="a"><path fill="#fff" d="M.333 0h20v20h-20z"/></clipPath></defs></svg>
                </i> Add to Cart</button>
              </div>
              <div class="product-count-btn">
                <div class="product-count-wrapper">
                  <button class="btn-decreament">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2"><path fill="#fff" d="M0 .375h10v1.25H0V.375Z"/></svg>
                  </button>
                  <span class="item-quantity">1</span>
                  <button class="btn-increament">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#fff" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"/></svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="product-text-wrapper">
              <p class="category-name">${item.category}</p>
              <p class="product-name">${item.name}</p>
              <span class="product-price">$${item.price}</span>
            </div>
  
          </div>`;
          })
          .join("");

        productGrid.innerHTML = productItemHTML;
      })
      .catch((error) => {
        console.error("Error fetching the data:", error);
      });
  }

  const observer = new MutationObserver((mutationsList, observer) => {
    mutationsList.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        setupAddToCartListeners();
        setUpQuantityListeners();
      }
    });
  });

  const cartItemsObserver = new MutationObserver((mutationsList, cartItemsObserver) =>{
    mutationsList.forEach((mutation) => {
      if(mutation.addedNodes.length > 0) {
        setUpRemoveCartItemListener();
      } else {
        displayEmptyCart();
      }
    })
  });

  const productContainer = document.querySelector(".products-grid");
  observer.observe(productContainer, { childList: true });

  const cartDetailsCardHtml = document.querySelector(".cart-details");
  cartItemsObserver.observe(cartDetailsCardHtml, {childList: true})

  /**
   * Add to cart event listeners.
   */
  function setupAddToCartListeners() {
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

    addToCartButtons.forEach((button) => {
      button.addEventListener("click", function () {
        //Add active state
        const productItem = button.closest(".product-item");
        const productImage = productItem.querySelector(".product-image");
        productImage.classList.add("active-item");
        const productsQuantityBtn =
          productItem.querySelector(".product-count-btn");
        productsQuantityBtn.style.visibility = "visible";

        const addToCartBtn = productItem.querySelector(".cart-btn-container");

        addToCartBtn.style.visibility = "hidden";

        // END

        //Add item to cart
        const productName = productItem.querySelector(".product-name");

        addToCart(productName.innerHTML);

        displayCartDetails();
      });
    });
  }

  /**
   * Increase or decrease item quantity event listeners.
   */
  const setUpQuantityListeners = () => {
    const increamentbtns = document.querySelectorAll(".btn-increament");
    const decreamentbtns = document.querySelectorAll(".btn-decreament");

    increamentbtns.forEach((button) => {
      button.addEventListener("click", function () {
        const productItem = button.closest(".product-item");
        const productName = productItem.querySelector(".product-name");
        const itemQuantity = productItem.querySelector(".item-quantity");
        itemQuantityIncreament(productName.innerHTML);

        const item = cart.find((p) => p.name === productName.innerHTML);
        itemQuantity.innerHTML = item.quantity;

        displayCartDetails();
      });
    });

    decreamentbtns.forEach((button) => {
      button.addEventListener("click", function () {
        const productItem = button.closest(".product-item");
        const productName = productItem.querySelector(".product-name");
        const itemQuantity = productItem.querySelector(".item-quantity");
        itemQuantityDecreament(productName.innerHTML);

        const item = cart.find((p) => p.name === productName.innerHTML);
        itemQuantity.innerHTML = item.quantity;

        displayCartDetails();
      });
    });
  };

  /**
   * Remove item from cart event listeners.
   */
  const setUpRemoveCartItemListener = () => {
      const removeItemBtns = document.querySelectorAll('.btn-remove-item');

      if(removeItemBtns){
        removeItemBtns.forEach((button) => {
          button.addEventListener('click', function(){
            const productNameHTML = document.querySelectorAll('.product-name');

          
            const cartItem = button.closest('.cart-item');
          
            const cartItemName = cartItem.querySelector('.cart-item-name');

            productNameHTML.forEach((element) => {
              if(element.innerHTML === cartItemName.innerHTML){
                  const btnAddCartContainer = element.closest('.product-text-wrapper');
                  const productItemDiv = btnAddCartContainer.closest('.product-item');

                  const btnAddToCart = productItemDiv.querySelector('.cart-btn-container');
                  const btnItemQuantity = productItemDiv.querySelector('.product-count-btn');
                  const productImage = productItemDiv.querySelector('.product-image');
                  productImage.classList.remove("active-item");
                  
                  btnAddToCart.style.visibility = 'visible';
                  btnItemQuantity.style.visibility = 'hidden';
              }
            })

            removeCartItem(cartItemName.innerHTML);

            displayCartDetails();
            
          })
        });
      }
  }


  /**
   * Add item to cart.
   * @param {*} productName 
   */
  const addToCart = (productName) => {
    const product = productsList.find((p) => p.name === productName);

    cart.push({ ...product, quantity: 1 });
  };

  /**
   * Remove cart item
   * @param {*} productName 
   */
  const removeCartItem = (productName) => {
      const product = cart.filter(p => p.name !== productName);
      cart = product;
  }

  /**
   * Display cart details
   */
  const displayCartDetails = () => {
    const emptyCartCard = document.querySelector(".cart-content");

    emptyCartCard.style.display = "none";

    const cartDetailsCard = document.querySelector(".cart-details");
    const cartItemsCountHTML = document.querySelector(".cart-total-items");
    cartDetailsCard.style.display = "block";
    var cartTotal = 0.0;
    const productItemHTML = cart
      .map((item) => {
        const itemTotalPrice = item.price * item.quantity;

        cartTotal = cartTotal + itemTotalPrice;
        return `<div class="cart-item-details-wrapper">
            <div class="cart-item">
              <div class="cart-item-details" >
                <p class="cart-item-name">${item.name}</p>
                    <div class="item-price-wrapper">
                      <span class="cart-item-quantity">${item.quantity}x</span>
                      <span class="item-selling-price">@$${item.price}</span>
                      <span class="item-total-price">$${itemTotalPrice}</span>
                    </div>
              </div>
              <div>
                <div><button class="btn-remove-item"><i><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#CAAFA7" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/></svg>
                </i></button></div>
              </div>
            </div>
            <div class="item-underline"></div>
  
          </div>`;
      })
      .join("");

    cartItemsCountHTML.innerHTML = `Your Cart (${cart.length})`;
    const totalHTML = `<div class="order-total-wrapper">
            <span>Order Total</span>
            <p class="cart-total">$${cartTotal}</p>
          </div><div class="confirm-order-button-wrapper">
            <div class="carbon-nuetral-wrapper"><i><svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" fill="none" viewBox="0 0 21 20"><path fill="#1EA575" d="M8 18.75H6.125V17.5H8V9.729L5.803 8.41l.644-1.072 2.196 1.318a1.256 1.256 0 0 1 .607 1.072V17.5A1.25 1.25 0 0 1 8 18.75Z"/><path fill="#1EA575" d="M14.25 18.75h-1.875a1.25 1.25 0 0 1-1.25-1.25v-6.875h3.75a2.498 2.498 0 0 0 2.488-2.747 2.594 2.594 0 0 0-2.622-2.253h-.99l-.11-.487C13.283 3.56 11.769 2.5 9.875 2.5a3.762 3.762 0 0 0-3.4 2.179l-.194.417-.54-.072A1.876 1.876 0 0 0 5.5 5a2.5 2.5 0 1 0 0 5v1.25a3.75 3.75 0 0 1 0-7.5h.05a5.019 5.019 0 0 1 4.325-2.5c2.3 0 4.182 1.236 4.845 3.125h.02a3.852 3.852 0 0 1 3.868 3.384 3.75 3.75 0 0 1-3.733 4.116h-2.5V17.5h1.875v1.25Z"/></svg>
            </i><p>This is a <span>carbon-nuetral</span> delivery</p></div>
            <button class="confirm-order-btn">Confirm Order</button>
          </div>`;
    cartDetailsCard.innerHTML = productItemHTML;
    cartDetailsCard.innerHTML = cartDetailsCard.innerHTML + totalHTML;
  };

  const displayEmptyCart = () => {
    const emptyCartCard = document.querySelector(".cart-content");
    emptyCartCard.style.display = "flex";
    const cartDetailsCard = document.querySelector(".cart-details");
    cartDetailsCard.style.display = "none";
  }

  /**
   * Increament cart item quantity.
   * @param {*} itemName 
   */
  const itemQuantityIncreament = (itemName) => {
    const item = cart.find((p) => p.name === itemName);
    item.quantity++;
  };

  /**
   * Decreament Cart item quantity.
   * @param {*} itemName 
   */
  const itemQuantityDecreament = (itemName) => {
    const item = cart.find((p) => p.name === itemName);

    if (item.quantity > 1) {
      item.quantity--;
    }
  };
});
