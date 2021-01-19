const mkUrl = (o,id) => `/lightning/r/${o}/${id}/view`


/**
 * return array of pre mapped rows
 * @param {Array} records 
 * @param {Array} families - group records by family
 */
export function fieldMap(records, families){

    const map = records.map(record => {

        const { 
            product,
            pricebook,
        } = record;

        const result = Object.assign({}, record)

        result.show = true

        result.Quantity = product.Quantity ? product.Quantity : 1

        result.Name = product.Name

        result.Family = product.Family ? product.Family : ''

        result.UnitPrice = pricebook.UnitPrice

        result.product_link = mkUrl('Product2', product.Id)

        result.modDate = new Date(product.LastModifiedDate).toLocaleString('en-US', { 
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric', 
            minute: 'numeric', 
            hour12: true 
        })
    
        return result
    })
    
    return families.map((family, i) => {

        return Object.assign({
            key: '_k'+i,
            records: map.filter(x => x.Family === family.value)
        }, family);
    })
}
/**
 * return columns as requested by options
 * @param {Object} options 
 *   families: Array
 *   fields: String comma separated
 */
export const columns = [
    {
        label: 'Name',
        fieldName: 'product_link',
        type: 'url',
        wrapText: true,
        typeAttributes: {
            label: { 
                fieldName: 'Name' 
            }, 
            target: '_blank'
        },
        sortable: true
    },
    {
        label: 'Quantity',
        fieldName: 'Quantity',
        type: 'number',
        sortable: true,
        editable: true,
        hideDefaultActions: true,
    },
    {
        label: 'Unit Price',
        fieldName: 'UnitPrice',
        type: 'number',
        sortable: true,
        editable: true,
        hideDefaultActions: true,
    },
    {
        label: 'Modified',
        fieldName: 'modDate',
        type: 'date',
        sortable: true,
        hideDefaultActions: true,
        typeAttributes:{
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        },
    },

    {
        label: "Add Product", 
        type: 'button',
        typeAttributes: { 
            iconName: 'utility:add', 
            label: 'Add 1'
        }
    
    }
]
/* 
{
        label: "Add Product", 
        type: 'button',
        typeAttributes: { 
            iconName: 'utility:add', 
            label: 'Add'
        }
    }
{
    //label: 'Actions',
    type: 'action',
    typeAttributes: { 
        fieldName: "rowActions",
        rowActions: [
            {
                label: 'Details',  //Required. The label that's displayed for the action
                name: 'detail',   //Required. The name of the action, which identifies the selected action
                iconName: 'utility:list', //The name of the icon to be displayed to the right of the action item.
            },
        ], 
        menuAlignment: 'auto',
    } 
},
*/


/**
 * Sort records via given parameters
 * @param {Array} records array of records to sort ([])
 * @param {String} fieldName name of field to sort by (Name)
 * @param {String} sortDirection direction to sort by (asc|desc)
 * @param {Object} options what to consider during sort; {date_fields}
 * @returns {Array} sorted array
 */
export function sortData(records, fieldName, sortDirection, options = {}) {

    const { date_fields } = options

    if(date_fields.includes(fieldName)) {
        
        if(sortDirection === "desc") {

            return records.sort((A,B) => {

                const a = A[fieldName] ? A[fieldName] : 0
                const b = B[fieldName] ? B[fieldName] : 0

                return new Date(b).getTime() - new Date(a).getTime()
            })
        }
        else if(sortDirection === "asc") {

            return records.sort((A,B) => {

                const a = A[fieldName] ? A[fieldName] : 0
                const b = B[fieldName] ? B[fieldName] : 0

                return new Date(a).getTime() - new Date(b).getTime()
            })
        }
    }

    

    if(sortDirection === "desc") {

        return records.sort((A,B) => {

            const a = A[fieldName] ? A[fieldName] : ''
            const b = B[fieldName] ? B[fieldName] : ''

            return b.toUpperCase() < a.toUpperCase() 
                ? -1
                : b.toUpperCase() > a.toUpperCase() 
                    ? 1
                    : 0 //equal
        });
    }
    else if(sortDirection === "asc") {

        return records.sort((A,B) => {

            const a = A[fieldName] ? A[fieldName] : ''
            const b = B[fieldName] ? B[fieldName] : ''

            return a.toUpperCase() < b.toUpperCase() 
                ? -1
                : a.toUpperCase() > b.toUpperCase() 
                    ? 1
                    : 0 //equal
        });
    }

    return records
}



/**
 * Filter records via given parameters
 * @param {Array} records array of records to filter ([{},{}])
 * @param {Array} props array of properties to filter on [Name,Family]
 * @param {String} value value to filter by
 * @returns {Array} filtered array
 */
export function filterData(records, props, value) {

	return records.filter(record => {
		return props.some(field => {
			return String(record[field]).toLocaleLowerCase().includes(value.toLocaleLowerCase())
		})
	})
}
