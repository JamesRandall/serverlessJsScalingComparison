const handlebars = require('handlebars');
const http = require('http');
const agent = new http.Agent({keepAlive: true});

exports.handler = (event, context, callback) => {
    let template = ''
    let content = ''
    let sidebar = ''

    const getRequest = (path, then) => {
        console.log(path)
        httpRequest = http.request({
            host: 's3.eu-west-2.amazonaws.com',
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
            callback(null, {
                statusCode: 500,
                body: `Error: ${e.message}`,
                headers: {
                    'Content-Type': 'text/plain'
                }
            });
        });
        httpRequest.end();
    }

    getRequest('/serverlessblogdev.azurefromthetrenches.com/templates/layout.handlebars', textTemplate => {
        template = textTemplate
        getRequest('/serverlessblogdev.azurefromthetrenches.com/output/homepage.html.snippet', textContent => {
            content = textContent
            getRequest('/serverlessblogdev.azurefromthetrenches.com/output/sidebar.html.snippet', textSidebar => {
                sidebar = textSidebar
                const templatePayload = {
                    blogName: 'Azure From The Trenches',
                    defaultAuthor: 'James Randall',
                    pageTitle: 'Azure From The Trenches',
                    readingContent: content,
                    sidebar: sidebar,
                    stylesheetUrl: 'https://s3.eu-west-2.amazonaws.com/serverlessblogdev.azurefromthetrenches.com/style/serverlessblog.css',
                    favIconUrl: 'https://s3.eu-west-2.amazonaws.com/serverlessblogdev.azurefromthetrenches.com/style/favicon.ico'
                }
            
                const compiledTemplate = handlebars.compile(template)
                const output = compiledTemplate(templatePayload)

                callback(null, {
                    statusCode: 200,
                    body: output,
                    headers: {
                        'Content-Type': 'text/html'
                    }
                })
            })
        })
    })
};