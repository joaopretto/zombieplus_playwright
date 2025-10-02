const {test: base, expect} = require('@playwright/test');
const { Login } = require("./actions/Login");
const { Movies } = require("./actions/Movies");
const { PopUp } = require("./actions/Components");
const { Leads } = require("./actions/Leads");

const test = base.extend({
    page: async ({page}, use) => {
        
        const context = page;

        context['leads'] = new Leads(page);
        context['login'] = new Login(page);
        context['movies'] = new Movies(page);
        context['popup'] = new PopUp(page);

        await use(page)
    }
})

export { test, expect }