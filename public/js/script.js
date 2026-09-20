(() => {
    'use strict'

    const forms = document.querySelectorAll('.needs-validation')

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })

    document.querySelectorAll('[data-bs-dismiss="alert"]').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.alert')?.remove()
        })
    })
})()