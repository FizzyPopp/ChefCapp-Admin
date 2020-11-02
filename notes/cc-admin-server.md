# cc-admin Server Architecture Document

- API - data flow between client and server
- client - what does the interface look like?
- server - data protection, privacy, logging

## Implementations and Software choice

- expressjs + container to compartmentalize the update engine
- stash the schemas on firebase for live update capability?


### Authentication and Access Scheme

Users include the dev team, but most importantly future hires that will need varying levels of access to change and update the software.

#### Access levels

**Admin**:

- access to admin sdk directly
- access to 'full stack' deployment tools

**Editor**:

- access to CC-staging
- require a preview for their work

**User**:

- access to a 'user submission form'
- other details to be determined post-MVP


## API endpoints

root: 

`~/cc-admin`

### /portal

- serves the webapp


### /recipe

Representative of the `recipes` collection on firestore. Theoreticalyl the webapp will ping this endpoint with get/post/put requests and the server will handle validation and updates.

### /validate

Accesses the validation functionality of the server app, set up as a microservice that basically responds `true` or `false` to a request with an object and type data attached.
