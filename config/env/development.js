
'use strict';

module.exports = {
    couch: 'http://localhost:5984',
    publishedcouch: 'http://localhost:5984',
    cmsdb: 'cleandb',
    sitedb: 'cleanpub',
    app: {
        title: 'CLEAN CMS',
        frontEndUrl: 'http://localhost:3000'
    },
    bluemix: {
        clientID: process.env.SSO_CLIENT_ID || ' ',
        clientSecret: process.env.SSO_CLIENT_SECRET || ' ',
        callbackURL: 'SITE_URL',
        authorizationURL : 'https://idaas.ng.bluemix.net/sps/oauth20sp/oauth20/authorize',
        tokenURL : 'https://idaas.ng.bluemix.net/sps/oauth20sp/oauth20/token',
        profileURL: 'https://idaas.ng.bluemix.net/idaas/resources/profile.jsp'
    }
};
