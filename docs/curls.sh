# mine
TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjM0LCJ1c2VyaWQiOjM0LCJpYXQiOjE3NTA0MDIzMzcsImV4cCI6MTc1MTI2NjMzN30.ichngCaheWHvz4QQvc1HZC6Hi6N2xLnYiki7WBbw65w
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
  "http://localhost:3000/assets/search/buys?query=&page=1" \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:3000/assets/action/buys \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "buyTime": "2025-05-20T10:00:00Z",
  "assetId": 2,
  "count": 100,
  "currencyId": 1,
  "exchangeRate": 7.2,
  "price": 80,
  "amount": 15050,
  "strategy": 2,
  "totalPay": 15200,
  "feeRate": 0.001,
  "fee": 150,
  "dividendYield": 0.05,
  "accountId": 1,
  "desc": "fuck this away"
}'

curl -X POST http://localhost:3000/assets/action/buys \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "assetId": 3314,
  "buyTime": 1740420000000,
  "currencyId": 2,
  "exchangeRate": 1,
  "price": 18.545,
  "amountOri": 1356,
  "amount": 1356,
  "strategy": 2,
  "feeRate": 0.019883071632344505,
  "fee": 5,
  "financing": false,
  "financeRate": 0.0588
}'

curl -X POST http://localhost:3000/assets/action/distributions \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "VM",
  "desc": "Profit distribution",
  "fishing": 8,
  "fruitTree": 40,
  "vegetable": 5,
  "hunting": 2,
  "ecology": 30,
  "pie": 15
}'

curl -X POST http://localhost:3000/assets/action/distributions/update \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "id": 2,
  "name": "For Test3",
  "desc": "Profit distribution",
  "fishing": 20,
  "fruitTree": 20,
  "vegetable": 20,
  "hunting": 20,
  "ecology": 10,
  "pie": 10
}'

curl -X GET http://localhost:3000/assets/distributions \
-H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:3000/assets/action/sells \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "sellTime": "2024-03-20T10:00:00Z",
  "assetId": 1,
  "buysId": 80,
  "currencyId": 1,
  "exchangeRate": 7.2,
  "amount": 8025,
  "sellPrice": 160.5,
  "feeRate": 0.001,
  "fee": 80,
  "fishingRatio": 100,
  "fruitRatio": 0,
  "vegetableRatio": 0,
  "huntingRatio": 0,
  "ecologyRatio": 0,
  "pieRatio": 0,
  "distributionType": 1
}'

curl -X POST http://localhost:3000/assets/action/buys/update \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "id": 65,
  "price": 110,
  "assetId": 2
}'

curl -X POST http://localhost:3000/assets/action/sells/update \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "id": 25,
  "buysId": 66
}'

curl -X POST http://localhost:3000/assets/action/incomes \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "incomeTime": "2024-03-20T10:00:00Z",
  "currencyId": 1,
  "exchangeRate": 7.2,
  "amount": 1000,
  "distributionId": 0,
  "distributionType": 0,
  "fishingRatio": 20,
  "fruitRatio": 20,
  "vegetableRatio": 20,
  "huntingRatio": 20,
  "ecologyRatio": 10,
  "pieRatio": 10
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
  "expensesTime": "2024-03-20T10:00:00Z",
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
  "ecology": 10,
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
  "deadline": "2024-03-20T10:00:00Z"
}'

curl -X POST http://localhost:3000/assets/action/repays \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "repayTime": "2024-03-20T10:00:00Z",
  "desc": "Loan repayment",
  "currencyId": 1,
  "borrowId": 10,
  "exchangeRate": 7.2,
  "amount": 2000,
  "interestRate": 0.1,
  "interest": 200,
  "rtype": 2
}'

curl -X POST http://localhost:3000/assets/action/repays/update \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "id": 22,
  "repayTime": "2024-03-20T10:00:00Z",
  "rtype": 2,
  "left": 1
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
  "manager": "1"
}'

curl -X POST http://localhost:3000/assets/accounts/update \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "id": 1,
  "name": "HKD1",
  "desc": "HKD1",
  "manager": "1"
}'

curl -X POST http://localhost:3000/assets/accounts/delete \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "id": 1
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

curl -X GET http://localhost:3000/assets/search/buys?query=&page=1 \
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
  -H "Accept: text/event-stream" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好，请介绍一下自己"
  }'

curl -X GET 'http://localhost:3000/contents/questions?referenceId=1&summary=123' \
  -H "Authorization: Bearer $TOKEN"

curl -X POST 'http://localhost:3000/contents' \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:3000/contents/trigger \
-H "Authorization: Bearer $TOKEN" 

curl -X POST http://localhost:3000/contents/test/trigger?userid=36 \
-H "Authorization: Bearer $TOKEN" 

curl -X GET 'http://localhost:3000/contents/reference/questions?referenceId=1&summary=美国将要开始降息' \
  -H "Authorization: Bearer $TOKEN"

curl -X GET http://localhost:3000/assets/currencies \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:3000/assets/action/assets/update \
  -H "Authorization: Bearer $TOKEN"


curl -X GET http://localhost:3000/assets/pnl \
  -H "Authorization: Bearer $TOKEN"

curl -X GET 'http://localhost:3000/assets/pnl/history?strategy=0&period=1&realized=false' \
  -H "Authorization: Bearer $TOKEN"

curl -X GET 'http://localhost:3000/assets/history/buys?page=1&query=' \
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

curl -X GET 'http://localhost:3000/assets/strategy?stype=6' \
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

curl -X GET 'http://localhost:3000/assets/test/create/totalpnl?userid=43' \
  -H "Authorization: Bearer $TOKEN"

### upload file to qiniu
curl -X POST http://localhost:3000/auth/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/home/ubuntu/code/eth.jpeg"

curl -X GET 'http://localhost:3000/auth/switch?userid=33' \
  -H "Authorization: Bearer $TOKEN"



curl -X POST 'http://43.156.245.36:3004/solana/transfer' \
  -H "Content-Type: application/json" \
  -d '{
    "from": "1234567890",
    "to": "1234567890",
    "amount": 1000000000000000000
  }' 

curl -X POST 'http://localhost:3000/contents/courses' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.baidu.com",
    "title": "示例课程1",
    "summary": "示例课程1"
  }'


curl -X GET 'http://localhost:3000/contents/courses?page=1' \
  -H "Authorization: Bearer $TOKEN"

curl -X GET 'http://localhost:3000/contents/aicourses' \
  -H "Authorization: Bearer $TOKEN"

curl -X POST 'http://localhost:3000/contents/chat/collect?dialogId=6&isCollect=true' \
  -H "Authorization: Bearer $TOKEN"

curl -X GET 'http://localhost:3000/contents/chat/collect?page=1' \
  -H "Authorization: Bearer $TOKEN"

curl -X GET 'http://localhost:3000/contents/chat/history?page=1' \
  -H "Authorization: Bearer $TOKEN"





curl -X GET 'http://localhost:3000/contents/courses?page=1' \
-H "Authorization: Bearer $TOKEN"


curl -X POST 'http://localhost:3000/auth/register' \
-H "Content-Type: application/json" \
-d '{
  "username": "Color",
  "password": "1234@56"
}'

curl -X POST 'http://localhost:3000/auth/login' \
-H "Content-Type: application/json" \
-d '{
  "username": "wushuang",
  "password": "wushuang"
}'

curl -X POST 'http://localhost:3000/auth/change' \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "oldPassword": "123456",
  "newPassword": "1234567"
}'

curl -X GET 'http://localhost:3000/assets/code?code=A001' \
-H "Authorization: Bearer $TOKEN"


#### color
TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjM2LCJ1c2VyaWQiOjM2LCJpYXQiOjE3NTA1MDkyMjcsImV4cCI6MTc1MTM3MzIyN30.Gt3xiyUHAKYc5YcOKKBsLVBkCTplqxeTi6y780ARjMQ


curl -X GET 'http://localhost:3000/assets/test/everything?key=asset_1'


curl -X GET 'http://localhost:3000/auth/hash?password=1234@56'

curl -X GET 'http://localhost:3000/contents/references?page=1&rtype=0&summaryId=870' \
  -H "Authorization: Bearer $TOKEN"


curl -X POST 'http://localhost:3000/assets/cache/assets/update' \
  -H "Authorization: Bearer $TOKEN"

## wushuang
TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQ0LCJ1c2VyaWQiOjQ0LCJpYXQiOjE3NTEzNDU3OTksImV4cCI6MTc1MjIwOTc5OX0.Q5aSwNV2oOoFYN81ADUFDYK-qJeWiMwpkj0yRjwmNHU