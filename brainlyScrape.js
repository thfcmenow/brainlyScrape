// thfcme@gmail.com 1/16/2020 - 0.0.1
// copy the question into the clipboard (i.e. ctrl c the question you want answering)
// run node brainlyScrape
// script retrieves first brainly google result and displays results along with screenshot
// read answers.html from the same folder that brainlyScrape.js is located in
// get clipboard contents

// needs:
// need to change to node.js error detection
// need more scenarios as questions can be answered in different ways

const $ = require('cheerio');
const puppeteer = require('puppeteer');
const clipboardy = require('clipboardy');
const fs = require('fs');
var comres = "";
var btn = "";
var marker = 0;
var i;

(async () => {
		  
		  // delay function to pause the browser - give it time to catch up
		  function delay(time) {
			return new Promise(function(resolve) { 
			setTimeout(resolve, time)
			});
			}
		  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
  	width: 1600,
  	height: 800
 });
 

// grab contents of clipboard
var fromClipboard =  clipboardy.readSync().replace(/"/g, '\\"')
 
console.log("I am asking: " + fromClipboard)
// if you want to test some questions - assign fromClipboard one of the following two questions:
// Which two lines of text in this excerpt from William Dean Howells's 'Editha' demonstrate the author’s opposition to"
// Which sentence in this excerpt from “The Yellow Wallpaper” by Charlotte Perkins Gilman suggests that the narrator may be prone to hallucinations?
 
// use google to find   
await page.goto('https://www.google.com/search?q=' + fromClipboard)
wait delay(900);

// get a lock on the first result and open it
let selector = 'a[href^="https://brainly.com"]';
try {var linkChosen = await page.evaluate(() =>document.querySelector(selector).innerHTML)}catch(err){var linkChosen="Error"}
await page.evaluate((selector) => document.querySelector(selector).click(), selector);
await delay(1500);

try {var answer = await page.evaluate(() =>document.querySelector(".js-answer-content").innerHTML)}catch(err){var answer="Error"}
console.log("I found the following answer: " + answer)
await delay(900)

await page.screenshot({ path: 'fullpage.png', fullPage: true });

// fine all elements with .sg-text
try{var comments = await page.evaluate(() => Array.from(document.querySelectorAll('.sg-text'), element => element.textContent))}catch(err){comments=""}

// scans .sg-text for the comments area on brainly
for (i = 0; i < comments.length; i++) {
		if (comments[i].indexOf("Comments (") > -1) { marker = 1 }
		if (comments[i].indexOf("Log in to add a") > -1) {marker = 0}
		if (marker == 1) {comres = comres + comments[i].trim() + "<br>"}
	}

// write output to html
fs.writeFile('answer.html', "<h2>" + fromClipboard + "</h2>" + "<br>" + answer + "<hr>" + comres + "<br><img style='width:950px;height=1100px' src='fullpage.png'>", (err) => {
  if (err) throw err;
});
 await browser.close();
})()
