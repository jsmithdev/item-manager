import { LightningElement, api } from 'lwc'

export default class DatatablePicklist extends LightningElement {

    @api label
    @api placeholder
    @api options
    @api value
    @api context

    renderedCallback(){
        if((this.value && this.context) && !this.init){
            this.init = true
            this.template.querySelector('select').context = this.context
            this.template.querySelector('select').value = this.value
        }
    }

    custom__handleChange(event) {

        const { context } = this;
        const { value } = event.target;

        const detail = {
            type: 'picklist-change',
            value,
            context,
        }
        
        this.dispatchEvent(new CustomEvent('picklist', {
            detail,
            composed: true,
            bubbles: true,
            cancelable: true,
        }))
    }
}