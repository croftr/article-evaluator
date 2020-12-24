# article-evaluator
Read news articles and use sentiment analysis to determine if they are positive, negative or neutral

To run it 
npm start

To kick off the evaluation process hit this url and provide the tags you want it to match on. e.g.

With tags
http://localhost:3000/read?tags=food,trump,europe,virus,covid,sport,uk,police,politics,religion,drug&baseUrl=https://www.theguardian.com&pageUrl=https://www.theguardian.com/world

Without tags
http://localhost:3000/read?tags=*&baseUrl=https://www.theguardian.com&pageUrl=https://www.theguardian.com/world
http://localhost:3000/read?tags=*&baseUrl=https://news.sky.com&pageUrl=https://news.sky.com/

------------------
JSDOM annoying stylesheet parsing error
comment out lines 34 - 38 in 
C:\Users\rob\repos\article-evaluator\node_modules\jsdom\lib\jsdom\living\helpers\stylesheets.js

