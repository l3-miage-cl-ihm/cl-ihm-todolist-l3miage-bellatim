describe('premier test', () => {
  it('Visits the initial project page', () => {
    cy.visit('/')
    cy.contains('Please login.')
    cy.contains('Connectez vous avec Google')
    cy.contains('anonyme').click()
    cy.contains('nouvelle liste').click()
    cy.get('.todo-list').should('not.have.descendants')
  })
  // it('tests footer', () => {
    
  // });
})
