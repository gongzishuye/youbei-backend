curl -X POST \
  http://localhost:3000/assets \
  -H 'Content-Type: application/json' \
  -d '{
    "code": "A001",
    "name": "示例资产",
    "price": 100,
    "atype": 1,
    "category": "示例分类",
    "market": 1,
    "currency": 1,
    "bonus_rate": 0.1,
    "asset_pool": 1,
    "creater": "示例创建者"
  }'

curl -X POST http://localhost:3000/assets/buys \
-H "Content-Type: application/json" \
-d '{
  "buyTime": "2024-03-20T10:00:00Z",
  "assetId": 1,
  "count": 100,
  "currencyId": 1,
  "exchangeRate": 7.2,
  "price": 150.5,
  "amount": 15050,
  "strategy": 1,
  "totalPay": 15200,
  "feeRate": 0.001,
  "fee": 150,
  "financing": false,
  "financeRate": 0,
  "dividendYield": 0.05
}'

curl -X POST http://localhost:3000/assets/distributions \
-H "Content-Type: application/json" \
-d '{
  "name": "For Test",
  "desc": "Profit distribution",
  "fishing": 20,
  "fruitTree": 20,
  "vegetable": 20,
  "hunting": 20,
  "ecology": 10,
  "pie": 10
}'

curl -X POST http://localhost:3000/assets/sells \
-H "Content-Type: application/json" \
-d '{
  "sellTime": "2024-03-20T10:00:00Z",
  "assetId": 1,
  "buysId": 1,
  "count": 50,
  "currencyId": 1,
  "exchangeRate": 7.2,
  "price": 160.5,
  "amount": 8025,
  "sellPrice": 160.5,
  "distributionId": 1
}'

curl -X POST http://localhost:3000/assets/incomes \
-H "Content-Type: application/json" \
-d '{
  "incomeTime": "2024-03-20T10:00:00Z",
  "currencyId": 1,
  "exchangeRate": 7.2,
  "amount": 1000,
  "distributionId": 1,
  "fishingRatio": 20,
  "fruitRatio": 20,
  "vegetableRatio": 20,
  "huntingRatio": 20,
  "ecologyRatio": 10,
  "pieRatio": 20,
  "type": 1,
  "description": "Dividend income"
}'

curl -X POST http://localhost:3000/assets/outcomes \
-H "Content-Type: application/json" \
-d '{
  "outcomeTime": "2024-03-20T10:00:00Z",
  "desc": "Management fee",
  "category": 1,
  "currencyId": 1,
  "amount": 500,
  "exchangeRate": 7.2,
  "equRmb": 3600,
  "strategy": 1
}'

curl -X POST http://localhost:3000/assets/borrows \
-H "Content-Type: application/json" \
-d '{
  "borrowTime": "2024-03-20T10:00:00Z",
  "currencyId": 1,
  "exchangeRate": 7.2,
  "amount": 10000,
  "interests": 1000,
  "deadline": "2024-03-20T10:00:00Z",
  "desc": "New loan"
}'

curl -X POST http://localhost:3000/assets/repays \
-H "Content-Type: application/json" \
-d '{
  "repayTime": "2024-03-20T10:00:00Z",
  "desc": "Loan repayment",
  "currencyId": 1,
  "borrowId": 1,
  "exchangeRate": 7.2,
  "amount": 2000,
  "amountLeft": 8000,
  "interests": 1000
}'

curl -X POST http://localhost:3000/assets/currencies \
-H "Content-Type: application/json" \
-d '{
  "name": "USD",
  "code": "USD",
  "symbol": "USD",
  "exchangeRate": 7.3,
  "description": "US Dollar"
}'


