import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Purchase } from '../common/purchase';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private purchaseUrl='http://localhost:9090/api/checkout/purchase';

  constructor(private httpclint:HttpClient) { }

  placeOrder(purchase:Purchase):Observable<any>{
    return this.httpclint.post<Purchase>(this.purchaseUrl,purchase);
  }
}
