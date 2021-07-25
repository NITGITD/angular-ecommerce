import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../common/product';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = "http://localhost:9090/products";

  constructor(private httpClient: HttpClient) { }

  getProductList():Observable<Product[]>{
    console.log("calling rest")
    return this.httpClient.get<Product[]>(this.baseUrl).pipe(map(response=>{
      return response;
    }
      ));
  }
  
}
