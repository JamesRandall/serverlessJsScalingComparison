const handlebars = require('handlebars');
const http = require('http');
const agent = new http.Agent({keepAlive: true});

module.exports = function (context, req) {
    let template = ''
    let content = ''
    let sidebar = ''

    const getRequest = (path, then) => {
        console.log(path)
        httpRequest = http.request({
            host: 'serverlessblogdev.blob.core.windows.net',
            port: 80,
            path: path,
            method: 'GET',
            headers: {
                'accept': '*/*',
                'accept-encoding': 'gzip, deflate'
            },
            agent: agent
        }, httpResponse => {
            let rawData = ''
            httpResponse.setEncoding('utf8')
            httpResponse.on('data', chunk => { rawData += chunk})
            httpResponse.on('end', () => {
                then(rawData)
            })
        })
        httpRequest.on('error', (e) => {
            context.res = {
                status: 500,
                body: `Error: ${e.message}`
            }
            context.done();
        });
        httpRequest.end();
    }

    getRequest('/templates/layout.handlebars', textTemplate => {
        template = textTemplate
        getRequest('/output/homepage.html.snippet', textContent => {
            content = textContent
            getRequest('/output/sidebar.html.snippet', textSidebar => {
                sidebar = textSidebar
                const templatePayload = {
                    blogName: 'Azure From The Trenches',
                    defaultAuthor: 'James Randall',
                    pageTitle: 'Azure From The Trenches',
                    readingContent: content,
                    sidebar: sidebar,
                    stylesheetUrl: 'https://serverlessblogdev.blob.core.windows.net/style/serverlessblog.css',
                    favIconUrl: 'https://serverlessblogdev.blob.core.windows.net/style/favicon.ico'
                }
            
                const compiledTemplate = handlebars.compile(template)
                const output = compiledTemplate(templatePayload)

                context.res = {
                    body: output,
                    headers: {
                        'Content-Type': 'text/html'
                    }
                }
                context.done();
            })
        })
    })
};