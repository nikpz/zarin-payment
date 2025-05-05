const {sequelize} = require('../db');
const {DataTypes} = require('sequelize');

const Order = sequelize.define('order', {
  id: {type: DataTypes.UUID, primaryKey: true, defaultValue: sequelize.literal('uuid_generate_v4()')},
  email: {type: DataTypes.STRING, allowNull: false},
  firstName: {type: DataTypes.STRING, allowNull: false},
  lastName: {type: DataTypes.STRING, allowNull: false},
  country: {type: DataTypes.STRING, allowNull: false},
  addressLineOne: {type: DataTypes.STRING, allowNull: false},
  addressLineTwo: {type: DataTypes.STRING},
  city: {type: DataTypes.STRING, allowNull: false},
  state: {type: DataTypes.STRING, allowNull: false},
  zip: {type: DataTypes.STRING, allowNull: false},
  phone: {type: DataTypes.STRING},
  notes: {type: DataTypes.STRING},
  shippingCost: {type: DataTypes.INTEGER, defaultValue: 50, allowNull: false},
  total: {type: DataTypes.INTEGER, allowNull: false},
  codeMelli: {type: DataTypes.INTEGER, allowNull: false},
  shebas: {type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false},
}, {})

const Payments = sequelize.define('payment', {
  id: {type: DataTypes.UUID,  primaryKey: true, defaultValue: sequelize.literal('uuid_generate_v4()') },
  amount: {type: DataTypes.DECIMAL, allowNull: false},
  authority: {type: DataTypes.STRING(255), unique: true}, 
  status: {type: DataTypes.STRING(50)}, //'pending' , 'success', 'failed'

  transaction_id: {type: DataTypes.STRING, allowNull: false},
});

module.exports = {
  Order,
  Payments}
