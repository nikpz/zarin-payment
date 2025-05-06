const {Order, Cart, CartProduct, Product, OrderedProduct} = require('../db/models/models');
const { Op, fn, col } = require("sequelize");

class OrderService {
  
  async create_Order_With_Otp( otpId, email, firstName, lastName, country, addressLineOne, addressLineTwo, city,
    state, zip, phone, notes, codeMelli, shebas, orderedProducts, shippingCost, total) {
    
    //1-Insert into orders table if user non-authorized
    if (otpId === 'non-authorized') {
      const order = await Order.create({ email, firstName, lastName, country, addressLineOne, addressLineTwo, city,
        state, zip, phone, notes, codeMelli, shebas, shippingCost, total })

      //2-Insert into orderedProducts
      for (const product of orderedProducts) {
        // const orderedProduct = 
        await OrderedProduct.create({
          count: product.count,
          selectedSize: product.selectedSize,
          price: product.product.price,
          totalPrice: product.totalPrice,
          orderId: order.id,
          productId: product.product.id,
        })
      }
  
      //3-Select order from table orders
      const orderWithProducts = await Order.findOne({
        where: {id: order.id},
        include: [{
          model: OrderedProduct,
          as: 'orderedProducts',
          include: [{
            model: Product
          }]
        }]
      })
  
      return orderWithProducts;
    }

    //4-Select from carts table
    const cart = await Cart.findOne({
      where: {otpId},
      include: [{
        model: CartProduct,
        as: 'products',
        include: [{
          model: Product
        }]
      }]
    })

    //5-Insert into orders table (authorized user)
    const order = await Order.create({
      otpId, email, firstName, lastName, country, addressLineOne, addressLineTwo, city,
      state, zip, phone, notes, codeMelli, shebas, shippingCost, total })
    
    //6-Insert into orderedProducts
    for (const cartProduct of cart.products) {
      // const orderedProduct = 
      await OrderedProduct.create({
        count: cartProduct.count,
        selectedSize: cartProduct.selectedSize,
        price: cartProduct.price,
        totalPrice: cartProduct.totalPrice,
        orderId: order.id,
        productId: cartProduct.product.id,
      })
    }

    //7-Select from orders table base of order id
    const orderWithProducts = await Order.findOne({
      where: {id: order.id},
      include: [{
        model: OrderedProduct,
        as: 'orderedProducts',
        include: [{
          model: Product
        }]
      }]
    })

    return orderWithProducts;
  }

  async getAll(id, email, limit, offset) {

    if (!id && !email) {
      const orderWithProducts = await Order.findAndCountAll({
        order: [['id', 'DESC']], limit, offset
      })
      return orderWithProducts;
    }

    let parametersArray = [];

    if (id) {
      parametersArray.push({id: id})
    }

    if (email) {
      parametersArray.push({email: email})
    }

    const orderWithProducts = await Order.findAndCountAll({
      where: {
        [Op.or]: parametersArray
      },
      order: [['id', 'DESC']], limit, offset
    })
    return orderWithProducts;    
  }

  async getOne(id) {
    const orderWithProducts = await Order.findOne({
      where: {id},
      include: [{
        model: OrderedProduct,
        as: 'orderedProducts',
        include: [{
          model: Product
        }]
      }]
    })
    return orderWithProducts;
  }

  async getAllOtpOrders(otpId) {
    const orderWithProducts = await Order.findAll({
      where: {otpId},
      include: [{
        model: OrderedProduct,
        as: 'orderedProducts',
        include: [{
          model: Product
        }]
      }]
    })
    return orderWithProducts;
  }

  async getOrderStatistic(startDate, lastDate) {

    try {
      const orderStatistic = await Order.findAll({
        where: {
          createdAt: { [Op.between]: [new Date(startDate), new Date(lastDate)] },
        },
        attributes: [
          'createdAt', 
          [fn('date_trunc', 'day', col('createdAt')), 'orderDay'],
          [fn('COUNT', col('id')), 'orderCount']
        ],
        group: 'createdAt',
        raw: true,
        right: false,
        order: [['createdAt', 'ASC']],
      })

      const orderCountMap = new Map();
      orderStatistic.forEach((row) => {
        orderCountMap.set(row.orderDay.toISOString().split('T')[0], row.orderCount);
      });

      const generateDateArray = (startDay, lastDay) => {
        const dates = [];
        const startDate = new Date(startDay);
        const lastDate = new Date(lastDay);
      
        while (startDate <= lastDate) {
          dates.push(new Date(startDate));
          startDate.setDate(startDate.getDate() + 1);
        }
      
        return dates;
      }

      const dates = generateDateArray(startDate, lastDate)

      const orderCounts = dates.map((date) => ({
        date: date.toISOString().split('T')[0],
        count: orderCountMap.get(date.toISOString().split('T')[0]) || 0,
      }));
    
      return orderCounts;
    }
    catch (e) {
      console.error(e)
    }
  }

  async getSaleStatistic(startDate, lastDate) {

    try {
      const orderStatistic = await Order.findAll({
        where: {
          createdAt: { [Op.between]: [new Date(startDate), new Date(lastDate)] },
        },
        attributes: [
          'createdAt', 
          [fn('date_trunc', 'day', col('createdAt')), 'saleDay'],
          [fn('sum', col('total')), 'total']
        ],
        group: 'createdAt',
        raw: true,
        right: false,
        order: [['createdAt', 'ASC']],
      })

      const orderCountMap = new Map();
      orderStatistic.forEach((row) => {
        orderCountMap.set(row.saleDay.toISOString().split('T')[0], row.total);
      });

      const generateDateArray = (startDay, lastDay) => {
        const dates = [];
        const startDate = new Date(startDay);
        const lastDate = new Date(lastDay);
      
        while (startDate <= lastDate) {
          dates.push(new Date(startDate));
          startDate.setDate(startDate.getDate() + 1);
        }
      
        return dates;
      }

      const dates = generateDateArray(startDate, lastDate)

      const salesByDay = dates.map((date) => ({
        date: date.toISOString().split('T')[0],
        total: orderCountMap.get(date.toISOString().split('T')[0]) || 0,
      }));
    
      return salesByDay;
    }
    catch (e) {
      console.error(e)
    }
  }

  async getLifetimeOrders() {
    const authOrders = await Order.findAll({
      where: {
        userId: {[Op.ne]: null} 
      },
      attributes: [
        [fn('COUNT', col('id')), 'orders']
      ],
      raw: true
    })

    const nonAuthOrders = await Order.findAll({
      where: {
        userId: {[Op.eq]: null} 
      },
      attributes: [
        [fn('COUNT', col('id')), 'orders']
      ],
      raw: true
    })

    return {
      authOrders: authOrders[0].orders,
      nonAuthOrders: nonAuthOrders[0].orders
    };
  }
  
  async getLifetimeSales() {
    const lifetimeSales = await Order.findAll({
      attributes: [
        [fn('sum', col('total')), 'total']
      ],
    })

    return lifetimeSales;
  }
}

module.exports = new OrderService()
