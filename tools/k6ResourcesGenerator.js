// generator collection of embedded resources for k6 from performance entries

let entries = performance.getEntries()
let domain = document.domain.replace('www.','')
let href = document.location.href
let filename = `${document.location.href}.js`
let availableResources = []
let excludeKeywords = [
'cdn'
]
let excludedURLs = []
let i = 0

console.log(`start collection available resources from domain ${domain}`)
console.log('excluded')

entries.forEach(entry => {
    ++i

    // filter type entries
    if(entry.entryType == 'resource' && entry.name.includes(domain)) {

       // filter type resources
       if (
        entry.name.includes('.css') || 
        entry.name.includes('.js') || 
        entry.name.includes('.svg') || 
        entry.name.includes('.gif') || 
        entry.name.includes('.jpg') || 
        entry.name.includes('.ttf') || 
        entry.name.includes('.woff') || 
        entry.name.includes('.php') || 
        entry.name.includes('.ico') || 
        entry.name.includes('.png') 
       ) {
        
        if(excludeKeywords.length > 0) {
            excludeKeywords.forEach(ex => {
                if(entry.name.includes(ex)){
                    console.log(`⭕ ${entry.name}`)
                    excludedURLs.push(entry.name)
                } else {
                    availableResources.push(entry.name)
                }
            })
        } else {
            availableResources.push(entry.name)
        }



       } else {
           console.log(`⭕ ${entry.name}`)
           excludedURLs.push(entry.name)
       }
       
    } else {
       console.log(`⭕ ${entry.name}`)
       excludedURLs.push(entry.name)
    }
   
   if(entries.length == i) {
    console.log(availableResources)

    let heredoc = `
/*
Embedded resources for k6.io
- Generated: ${new Date()}
- Domanin: ${href}
*/

const resources = [
    `
    let i = 0
    availableResources.forEach(ars => {
        ++i
        heredoc = heredoc + `'${ars}'`
        if (availableResources.length > i) { heredoc = heredoc + `,\n` }
    })

    heredoc = heredoc + `
]
export default resources

/*
Exluded resources ${excludedURLs.length}:
    `

    let a = 0
    excludedURLs.forEach(ars => {
        ++a
        heredoc = heredoc + `'${ars}',\n`
    })

    heredoc = heredoc + `
*/
    `

    // generate and download file
    let blob = new Blob([heredoc], {type: 'application/javascript'})
    e = document.createEvent('MouseEvents'),
    a = document.createElement('a');

    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl =  ['application/javascript', a.download, a.href].join(':');
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
   }
})
