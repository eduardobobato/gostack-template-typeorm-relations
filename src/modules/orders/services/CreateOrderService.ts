import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found');
    }

    const productsResponse = await this.productsRepository.findAllById(
      products,
    );

    const productsOrder: {
      product_id: string;
      price: number;
      quantity: number;
    }[] = [];

    products.forEach(product => {
      const productIndex = productsResponse.findIndex(p => p.id === product.id);
      const productMatched = productsResponse[productIndex];
      if (
        !productMatched?.quantity ||
        productMatched?.quantity < product.quantity
      ) {
        throw new AppError(`Insufficient product quantity`);
      }

      productMatched.quantity -= product.quantity;
      productsOrder.push({
        product_id: product.id,
        price: productMatched.price,
        quantity: product.quantity,
      });
    });

    await this.productsRepository.updateQuantity(productsResponse);

    const order = await this.ordersRepository.create({
      customer,
      products: productsOrder,
    });

    return order;
  }
}

export default CreateOrderService;
