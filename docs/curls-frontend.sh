# mine
TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInVzZXJpZCI6MywiaWF0IjoxNzQ1MjA2NDc3LCJleHAiOjE3NDYwNzA0Nzd9.hcqTA9X6TuL4DJBADzdiJ1PSUaFiYP2n1bp5mL6VWZI
# zujian
TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJpZCI6MiwiaWF0IjoxNzQzMjQyMjU5LCJleHAiOjE3NDQxMDYyNTl9.J1tEBqPf3vksf7L6-JHNmRj0pPoLZySbaJGkd0-pb0s

curl -X POST http://localhost:3000/assets/action/buys \
-H "Authorization: Bearer $TOKEN" \
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
  "dividendYield": 0.05,
  "accountId": 1
}'

curl -X POST http://localhost:3000/assets/action/sells \
-H "Authorization: Bearer $TOKEN" \
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
  "feeRate": 0.001,
  "fee": 80,
  "distributionType": 1,
  "fishingRatio": 100,
  "fruitRatio": 0,
  "vegetableRatio": 0,
  "huntingRatio": 0,
  "ecologyRatio": 0,
  "pieRatio": 0
}'

curl -X POST http://localhost:3000/assets/action/incomes \
-H "Authorization: Bearer $TOKEN" \
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
  "distributionType": 1,
  "description": "Dividend income"
}'

curl -X POST http://localhost:3000/assets/action/expenses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
  "outcomeTime": "2024-03-20T10:00:00Z",
  "desc": "Management fee",
  "category": "vegetable",
  "currencyId": 1,
  "amount": 500,
  "exchangeRate": 7.2,
  "equRmb": 200,
  "deductedFrom": 1,
  "fishing": 20,
  "furitTree": 20,
  "vegetable": 20,
  "hunting": 20,
  "ecology": 410,
  "pie": 10
}'

curl -X POST http://localhost:3000/assets/action/borrows \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "borrowTime": "2024-03-20T10:00:00Z",
  "currencyId": 1,
  "exchangeRate": 7.2,
  "amount": 10000,
  "deadline": "2024-03-20T10:00:00Z",
  "desc": "New loan"
}'

curl -X POST http://localhost:3000/assets/action/repays \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "repayTime": "2024-03-20T10:00:00Z",
  "desc": "Loan repayment",
  "currencyId": 1,
  "borrowId": 1,
  "exchangeRate": 7.2,
  "amount": 2000,
  "rtype": 2
}'



####### history #######

curl -X GET 'http://localhost:3000/assets/history/buys?page=1' \
  -H "Authorization: Bearer $TOKEN"

curl -X GET 'http://localhost:3000/assets/history/sells?page=1' \
  -H "Authorization: Bearer $TOKEN"

curl -X GET 'http://localhost:3000/assets/history/incomes?page=1' \
  -H "Authorization: Bearer $TOKEN"
  
curl -X GET 'http://localhost:3000/assets/history/expenses?page=1' \
  -H "Authorization: Bearer $TOKEN"

curl -X GET 'http://localhost:3000/assets/history/borrows?page=1' \
  -H "Authorization: Bearer $TOKEN"
  
curl -X GET 'http://localhost:3000/assets/history/repays?page=1' \
  -H "Authorization: Bearer $TOKEN"


####### update #######

curl -X POST http://localhost:3000/assets/action/buys/update \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "id": 1,
  "amount": 8025
}'

curl -X POST http://localhost:3000/assets/action/incomes/update \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "id": 1,
  "currencyId": 2
}'

curl -X POST http://localhost:3000/assets/action/expenses/update \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
  "id": 1,
  "currencyId": 2
}'

curl -X POST http://localhost:3000/assets/action/sells/update \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
  "id": 1,
  "buysId": 1
}'

curl -X POST http://localhost:3000/assets/action/borrows/update \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
  "id": 1,
  "amount": 10000
}'

curl -X POST http://localhost:3000/assets/action/repays/update \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
  "id": 1,
  "amount": 2000
}'



####### 六大策略详情页 #######
####### 每个页面会有三个接口
####### 1. 六大策略详情页共有页面：/assets/strategy
####### 2. 六大策略详情页历史收益：/assets/pnl/history
####### 3. 六大策略问题：/contents/strategy/questions

# strategy取值1-6
curl -X GET 'http://localhost:3000/assets/strategy?strategy=1' \
  -H "Authorization: Bearer $TOKEN"

# strategy取值1-6；time取值1-3，1-日，2-月，3-年
curl -X GET 'http://localhost:3000/assets/pnl/history?strategy=1&time=1' \
  -H "Authorization: Bearer $TOKEN"

# strategy取值1-6
curl -X GET 'http://localhost:3000/contents/strategy/questions?strategy=1' \
  -H "Authorization: Bearer $TOKEN"