describe('Domain Model tests', () => {
  // warning on init for bad models
  // getModel
    // Builder mode
      // Partial yes
      // partial no
        // has error
          // sync field errors
          // missing field errors
        // has no error
    // Full def mode
  // Update
    // empty update
    // unrelated update
    // invalid update
      // Remove required field
      // Invalid value for sync field
      // attempt to update a async field
  // Apply certified update
    // valid cert
    // invalid cert
    // valid cert but sync error
    // valid cert but isRequired error
  // Validate sync fields
    // Valid update
    // Invalid update
    // multiple invalid updates
  // Validate no async fields
  // Validate model is complete
  
});