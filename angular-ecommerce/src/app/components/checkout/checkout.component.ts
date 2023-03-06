import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { EcommerceFormService } from 'src/app/services/ecommerce-form.service';
import { ecommerceValidators } from 'src/app/validators/ecommerce-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder, 
    private ecommerceForm: EcommerceFormService,
    private cartService:CartService,
    private checkout:CheckoutService,
    private router:Router) { }

  ngOnInit(): void {
    this.reviewCartDetails();
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required,
        Validators.minLength(2),
        ecommerceValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required,
        Validators.minLength(2),
        ecommerceValidators.notOnlyWhitespace]),
        email: new FormControl('',
          [Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2),
        ecommerceValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2),
        ecommerceValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipcode: new FormControl('', [Validators.required, Validators.minLength(2),
        ecommerceValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2),
        ecommerceValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2),
        ecommerceValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipcode: new FormControl('', [Validators.required, Validators.minLength(2),
        ecommerceValidators.notOnlyWhitespace])
      }),
      creditCardAddress: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2),
          ecommerceValidators.notOnlyWhitespace]),
        cardNumber:new FormControl('', [Validators.required,Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required,Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })

    });
    const startMonth: number = new Date().getMonth() + 1;
    console.log("statrtMonth: " + startMonth);
    this.ecommerceForm.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;

      }
    );
    this.ecommerceForm.getCreditCardYears().subscribe(
      data => {
        console.log("Retrieved credit card years: " + JSON.stringify(data));
        this.creditCardYears = data;
      }
    )
    this.ecommerceForm.getCountries().subscribe(
      data => {
        console.log("Retrieved countries:  " + JSON.stringify(data));
        this.countries = data;
      }
    );
  }


  reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      totalQuantity=>this.totalQuantity=totalQuantity
    );

    this.cartService.totalPrice.subscribe(
      totalPrice=>this.totalPrice=totalPrice
    );
  }



  onSubmit() {
    console.log("Handling the submit button");
    
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    let order=new Order();
     order.totalPrice=this.totalPrice;
     order.totalQuantity=this.totalQuantity;

     const cartItems=this.cartService.cartItems;

    //  let orderItems:OrderItem[]=[];
    //  for(let i=0;i<cartItems.length;i++){
    //   orderItems[i]=new OrderItem(cartItems[i]);
    //  }

     let orderItems:OrderItem[]=cartItems.map(tempCartItem=>new OrderItem(tempCartItem));

     let purchase=new Purchase();

     purchase.customer=this.checkoutFormGroup.controls['customer'].value;

     purchase.shippingAddress=this.checkoutFormGroup.controls['shippingAddress'].value;
     const shippingState:State=JSON.parse(JSON.stringify(purchase.shippingAddress.state));
     const shippingCountry:Country=JSON.parse(JSON.stringify(purchase.shippingAddress.country));
     purchase.shippingAddress.state=shippingState.name;
     purchase.shippingAddress.country=shippingCountry.name;

     purchase.billingAddress=this.checkoutFormGroup.controls['billingAddress'].value;
     const billingState:State=JSON.parse(JSON.stringify(purchase.billingAddress.state));
     const billingCountry:Country=JSON.parse(JSON.stringify(purchase.billingAddress.country));
     purchase.billingAddress.state=billingState.name;
     purchase.billingAddress.country=billingCountry.name;

     purchase.order=order;
     purchase.orderItems=orderItems;

     this.checkout.placeOrder(purchase).subscribe(
      {
         next:response=>{
           alert(`Your order has been received.\norder tracking number: ${response.orderTrackingNumber}`);
            this.resetCart();
         },
         error: err=>{
          alert(`There was an error: ${err.message}`)
         }
      }
     );
  }
  resetCart() {
    this.cartService.cartItems=[];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    this.checkoutFormGroup.reset();
    this.router.navigateByUrl("/products");
  }


  get firstName(): FormControl { return this.checkoutFormGroup.get('customer.firstName') as FormControl; }
  get lastName(): FormControl { return this.checkoutFormGroup.get('customer.lastName') as FormControl; }
  get email(): FormControl { return this.checkoutFormGroup.get('customer.email') as FormControl; }

  get shippingAddressStreet(): FormControl { return this.checkoutFormGroup.get('shippingAddress.street') as FormControl; }
  get shippingAddressCity(): FormControl { return this.checkoutFormGroup.get('shippingAddress.city') as FormControl; }
  get shippingAddressState(): FormControl { return this.checkoutFormGroup.get('shippingAddress.state') as FormControl; }
  get shippingAddressCountry(): FormControl { return this.checkoutFormGroup.get('shippingAddress.country') as FormControl; }
  get shippingAddressZipcode(): FormControl { return this.checkoutFormGroup.get('shippingAddress.zipcode') as FormControl; }

  get billingAddressStreet(): FormControl { return this.checkoutFormGroup.get('billingAddress.street') as FormControl; }
  get billingAddressCity(): FormControl { return this.checkoutFormGroup.get('billingAddress.city') as FormControl; }
  get billingAddressState(): FormControl { return this.checkoutFormGroup.get('billingAddress.state') as FormControl; }
  get billingAddressCountry(): FormControl { return this.checkoutFormGroup.get('billingAddress.country') as FormControl; }
  get billingAddressZipcode(): FormControl { return this.checkoutFormGroup.get('billingAddress.zipcode') as FormControl; }

  get creditCardType(): FormControl { return this.checkoutFormGroup.get('creditCardAddress.cardType') as FormControl; }
  get creditCardNameOnCard(): FormControl { return this.checkoutFormGroup.get('creditCardAddress.nameOnCard') as FormControl; }
  get creditCardCardNumber(): FormControl { return this.checkoutFormGroup.get('creditCardAddress.cardNumber') as FormControl; }
  get creditCardSecurityCode(): FormControl { return this.checkoutFormGroup.get('creditCardAddress.securityCode') as FormControl; }
  

  copyShippingAdressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls.billingAddress
        .setValue(this.checkoutFormGroup.controls.shippingAddress.value);

      this.billingAddressStates = this.shippingAddressStates;

    } else {
      this.checkoutFormGroup.controls.billingAddress.reset();

      this.billingAddressStates = [];
    }
  }
  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);
    let startMonth: number;
    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }
    this.ecommerceForm.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrived credit card months:  " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    )
  }
  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.ecommerceForm.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }
        formGroup?.get('state')?.setValue(data[0]);
      }
    )
  }

}
