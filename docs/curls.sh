# mine
TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInVzZXJpZCI6MywiaWF0IjoxNzQ3NzMxOTcxLCJleHAiOjE3NDg1OTU5NzF9.J6_r8K0PMj1XhkUVRKFj1UG3zrkQBnOx-6_H0FGWEWY
# zujian
TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJpZCI6MiwiaWF0IjoxNzQzMjQyMjU5LCJleHAiOjE3NDQxMDYyNTl9.J1tEBqPf3vksf7L6-JHNmRj0pPoLZySbaJGkd0-pb0s

curl -X POST \
  http://localhost:3000/assets/action/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '[
      {
      "code": "A009",
      "name": "示例资产9",
      "price": 100,
      "atype": 1,
      "category": "示例分类2",
      "market": 1,
      "currency": 1,
      "bonus_rate": 0.1,
      "asset_pool": 1,
      "creater": "示例创建者"
    }
  ]'

curl -X POST \
  http://localhost:3000/assets/action/assets/update \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '[
      {
      "code": "A009",
      "name": "示例资产9",
      "price": 300,
      "atype": 1,
      "category": "示例分类2",
      "market": 1,
      "currency": 1,
      "bonus_rate": 0.1
    },
    {
      "code": "A010",
      "name": "示例资产10",
      "price": 300,
      "atype": 1,
      "category": "示例分类2",
      "market": 1,
      "currency": 1,
      "bonus_rate": 0.1
    }
  ]'

curl -X GET \
  "http://localhost:3000/assets/search/assets?query=etf&page=1" \
  -H "Authorization: Bearer $TOKEN" 

curl -X GET \
  "http://localhost:3000/assets/action/buys/count?assetid=1" \
  -H "Authorization: Bearer $TOKEN"

curl -X GET \
  "http://localhost:3000/assets/search/buys?query=A&page=1" \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:3000/assets/action/buys \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "buyTime": "2025-05-20T10:00:00Z",
  "assetId": 1,
  "count": 100,
  "currencyId": 1,
  "exchangeRate": 7.2,
  "price": 100,
  "amount": 15050,
  "strategy": 5,
  "totalPay": 15200,
  "feeRate": 0.001,
  "fee": 150,
  "dividendYield": 0.05,
  "accountId": 1
}'

curl -X POST http://localhost:3000/assets/action/distributions \
-H "Authorization: Bearer $TOKEN" \
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

curl -X POST http://localhost:3000/assets/action/buys/update \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "id": 1,
  "amount": 8025
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

curl -X POST http://localhost:3000/assets/action/incomes/update \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "id": 1,
  "currencyId": 2
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

curl -X POST http://localhost:3000/assets/action/expenses/update \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
  "id": 1,
  "currencyId": 2
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
  "interestRate": 0.1,
  "interest": 200,
  "rtype": 2
}'

curl -X POST http://localhost:3000/assets/action/currencies \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "USDT",
  "symbol": "USDT",
  "exchangeRate": 7.3,
  "description": "HK Dollar"
}'

curl -X POST http://localhost:3000/assets/accounts \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "HKD",
  "desc": "HKD",
  "owner": 1,
  "manager": '1'
}'

curl -X GET http://localhost:3000/assets/statistics \
-H "Authorization: Bearer $TOKEN"

curl -X GET http://localhost:3000/assets/overview \
-H "Authorization: Bearer $TOKEN"

curl -X GET http://localhost:3000/assets/overview/pnl?ltype=1 \
-H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:3000/assets/pnl \
-H "Authorization: Bearer $TOKEN"

curl -X GET http://localhost:3000/assets/overview/debt \
-H "Authorization: Bearer $TOKEN"

curl -X GET http://localhost:3000/assets/overview/incomexpense \
-H "Authorization: Bearer $TOKEN"

curl -X GET http://localhost:3000/assets/overview/assets \
-H "Authorization: Bearer $TOKEN"


curl -X GET http://localhost:3000/assets/kline \
-H "Authorization: Bearer $TOKEN"

curl -X GET http://localhost:3000/assets/accounts \
-H "Authorization: Bearer $TOKEN"

curl -X GET http://localhost:3000/assets/search/buys?query=A&page=1 \
-H "Authorization: Bearer $TOKEN"


curl -X GET http://localhost:3000/assets/search/borrows?page=1 \
-H "Authorization: Bearer $TOKEN"

##### send code

curl -X GET http://43.156.245.36:3000/auth/send?phone=13141324281

curl -X POST http://localhost:3000/auth/verify \
-H "Content-Type: application/json" \
-d '{
  "phone": "13141324281",
  "code": "666666"
}'

curl -X GET http://localhost:3000/users/user \
-H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:3000/users/user \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "示例用户1",
  "nickname": "示例昵称1"
}'

curl -X POST http://localhost:3000/users/sub \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "子用户",
  "avatarUrl": "https://www.baidu.com"
}'

curl -X POST http://localhost:3000/users/sub/delete \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "userid": 4
}'

curl -X GET http://localhost:3000/auth/qiniutoken \
-H "Authorization: Bearer $TOKEN"

### chat
curl -N -X POST http://localhost:3000/contents/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好，请介绍一下自己"
  }'

curl -X GET 'http://localhost:3000/contents/questions?referenceId=1&summary=123' \
  -H "Authorization: Bearer $TOKEN"

curl -X POST 'http://localhost:3000/contents' \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:3000/contents/summary \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json"

curl -X GET http://localhost:3000/contents/summary \
  -H "Authorization: Bearer $TOKEN"

curl -X POST 'http://localhost:3000/contents/questions?referenceId=1&summary=美国将要开始降息' \
  -H "Authorization: Bearer $TOKEN"

curl -X GET http://localhost:3000/assets/currencies \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:3000/assets/action/assets/update \
  -H "Authorization: Bearer $TOKEN"


curl -X GET http://localhost:3000/assets/pnl \
  -H "Authorization: Bearer $TOKEN"

curl -X GET 'http://localhost:3000/assets/pnl/history?strategy=1&period=1' \
  -H "Authorization: Bearer $TOKEN"

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

curl -X GET 'http://localhost:3000/assets/strategy?stype=1' \
  -H "Authorization: Bearer $TOKEN"

curl -X GET 'http://localhost:3000/contents/references?page=1&rtype=0&summaryId=1' \
  -H "Authorization: Bearer $TOKEN"

curl -X GET 'http://localhost:3000/contents/articles?page=1&assetName=比特币' \
  -H "Authorization: Bearer $TOKEN"

curl -X GET 'http://localhost:3000/tasks/assets/update' \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:3000/assets/action/currencies/update \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "USDC",
    "symbol": "USDC",
    "exchangeRate": 7.4
  }'


curl -X GET 'http://localhost:3000/assets/test' \
  -H "Authorization: Bearer $TOKEN"

curl -X GET 'http://localhost:3000/assets/test/summary' \
  -H "Authorization: Bearer $TOKEN"

curl -X GET 'http://localhost:3000/assets/test/create/pnl?userid=1' \
  -H "Authorization: Bearer $TOKEN"