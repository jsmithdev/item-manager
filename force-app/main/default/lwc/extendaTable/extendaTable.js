import { api } from 'lwc'
import LightningDatatable from 'lightning/datatable'
import DatatablePicklistTemplate from './picklist-template.html'

export default class ExtendaTable extends LightningDatatable {

    @api families
    
    constructor() {
        super()
    }

    static customTypes = {
        picklist: {
            template: DatatablePicklistTemplate,
            typeAttributes: ['label', 'placeholder', 'options', 'value', 'context'],
        },
    }
}


// If you want to load custom css post render:
/*
import { loadStyle } from 'lightning/platformResourceLoader';
import ExtendaTableCSS from '@salesforce/resourceUrl/ExtendaTable';

async renderedCallback() {
    
    if(!this.hasRendered){
        await Promise.all([
            loadStyle(this, ExtendaTableCSS),
        ])
        this.hasRendered = true
    }
} 
*/