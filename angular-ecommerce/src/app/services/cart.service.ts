import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';
import { Product } from '../common/product';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  

  cartItems: CartItem[] = [];
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() {

  }
  addToCart(theCartItem: CartItem) {
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = new CartItem(new Product);
    if (this.cartItems.length > 0) {
      for (let tempCartItem of this.cartItems) {
        console.log('available item'+`${tempCartItem.name}`+ '   price--->' +`${tempCartItem.unitPrice}`)
        if (tempCartItem.id === theCartItem.id) {
          console.log('existd'+`${existingCartItem}`);

          existingCartItem = tempCartItem;
          console.log(`${existingCartItem}`);
          //existingCartItem=this.cartItems.find(tempCartItem=>tempCartItem.id===theCartItem.id);
          break;
        }else{
          console.log("already items available");
          //existingCartItem.quantity++;
          existingCartItem=theCartItem;
        }
          
      }
      alreadyExistsInCart = (existingCartItem != undefined);
      console.log('extsting--->'+`${alreadyExistsInCart}`);
  }
  if (alreadyExistsInCart) {
    //existingCartItem.quantity++;
    //existingCartItem.unitPrice;
    this.cartItems.push(existingCartItem);
    console.log('already exist items-->'+`${existingCartItem.quantity}`+'price--> '+ `${existingCartItem.unitPrice}`);
  }
  else {
    this.cartItems.push(theCartItem);
  }
  this.computeCartTotals();
  }
  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;
    console.log(``);
    for (let currentCartItem of this.cartItems) {
      console.log('current item quantity--->'+`${currentCartItem.quantity}`);
      console.log('current total price'+`${currentCartItem.unitPrice}`);
      console.log('currentCartItem quantity->'+`${currentCartItem.quantity}`);
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      
      totalQuantityValue +=currentCartItem.quantity;
      console.log(`${totalPriceValue}`);
      console.log(`${totalQuantityValue}`);
    }
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);
    this.logCartData(totalPriceValue,totalQuantityValue);
  }
  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('Contents of the cart');
    for(let tempCartItem of this.cartItems){
      
     const subTotalPrice=tempCartItem.quantity*tempCartItem.unitPrice;
     console.log('sub total--> '+`${subTotalPrice}`);
     console.log(`name: ${tempCartItem.name}, quantity: ${tempCartItem.quantity},unitPrice: ${tempCartItem.unitPrice}, subTotalPrice: ${subTotalPrice}`);
    } 
    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
     console.log('-------');
  }
  decrementQuantity(theCartItem: CartItem) {
   theCartItem.quantity--;
   if(theCartItem.quantity===0){
       this.remove(theCartItem);
   }else{
    this.computeCartTotals();
   }
  }
  remove(theCartItem: CartItem) {
    const itemIndex=this.cartItems.findIndex(tempCartItem=>tempCartItem.id===theCartItem.id);
    if(itemIndex>-1){
      this.cartItems.splice(itemIndex,1);
      this.computeCartTotals();
    }
  }

}

