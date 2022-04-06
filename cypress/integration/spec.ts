describe('My First Test', () => {
  it('Visits the initial project page', () => {
    cy.visit('/')
    cy.contains('Please login.')
    cy.contains('Connectez vous avec Google')
    cy.contains('<button')
  })
})
