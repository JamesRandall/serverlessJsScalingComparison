const handlebars = require('handlebars');
const http = require('http');
const agent = new http.Agent({keepAlive: true});

exports.homepageGET = function homepageGET(req, res) {
    let template = ''
    let content = ''
    let sidebar = ''

    const getRequest = (path, then) => {
        console.log(path)
        httpRequest = http.request({
            host: 'storage.googleapis.com',
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
            res.status(500).send(`Error: ${e.message}`);
        });
        httpRequest.end();
    }

    getRequest('/serverlessblog/templates/layout.handlebars', textTemplate => {
        template = textTemplate
        getRequest('/serverlessblog/output/homepage.html.snippet', textContent => {
            content = textContent
            getRequest('/serverlessblog/output/sidebar.html.snippet', textSidebar => {
                sidebar = textSidebar
                const templatePayload = {
                    blogName: 'Azure From The Trenches',
                    defaultAuthor: 'James Randall',
                    pageTitle: 'Azure From The Trenches',
                    readingContent: content,
                    sidebar: sidebar,
                    stylesheetUrl: 'https://storage.googleapis.com/serverlessblog/style/serverlessblog.css',
                    favIconUrl: 'https://storage.googleapis.com/serverlessblog/style/favicon.ico'
                }
            
                const compiledTemplate = handlebars.compile(template)
                const output = compiledTemplate(templatePayload)

                res.send(output);
            })
        })
    })
};