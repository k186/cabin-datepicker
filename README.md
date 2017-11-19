[![npm](https://img.shields.io/npm/v/pd-datepicker-pc.svg)](https://www.npmjs.com/package/pd-datepicker-pc)




Build Setup

```
# install dependencies
npm install


# build for production with minification
npm run compile

```
### install
```
npm i pd-datepicker-pc -S

need jquery and momentjs

```

### example
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="./src/pddatepicker.css"/>
    <script src="https://unpkg.com/moment@2.19.2/moment.js"></script>
    <script src="https://unpkg.com/jquery@3.2.1/dist/jquery.js"></script>
    <script src="dist/bundle.js"></script>
</head>
<body>


<div style="padding: 150px">
    <input type="text" id="app">
</div>
<script>
    $('#app').PdDatePicker({
      initDate:'2016-11-19 15:27',
      format:'YYYY-MM-DD HH:mm:ss'
    }).on('change',function (data) {
      console.log(data)
    })
    // PdDatePicker(id,options)
</script>
</body>
</html>

```


### options default
```
    startView: 3, @year{1} month{2} day{3} hour:min{4}
    maxView: 1,
    minView: 5,
    initDate: null,
    startDate: '2016-11-12',
    endDate: null,
    language: 'cn',
    format: 'YYYY-MM-DD',
    minuteRange: 1,
    containerId: null,
    hourList: null
```
 
