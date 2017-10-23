import find from 'lodash/find';

// Form Helper Functions

export const getFormField = (form, fieldName) => {

    return find(form.fields, function(field) {
        return field.name === fieldName;
    });
}
