'use strict';

const knex = require('../knex');

let searchTerm;
let searchId;
let updateCol;
let updateVal;
let newTitle;
let newContent;
//get all notes with search term filter
// knex
//   .select('notes.id', 'title', 'content')
//   .from('notes')
//   .modify(queryBuilder => {
//     if (searchTerm) {
//       queryBuilder.where('title', 'like', `%${searchTerm}%`);
//     }
//   })
//   .orderBy('notes.id')
//   .then(results => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.error(err);
//   });

//find by id with search filter
// knex('notes')
//   .select('notes.id', 'title', 'content')
//   .modify(queryBuilder => {
//     if (searchTerm) {
//       queryBuilder.where('title', 'like', `%${searchTerm}%`);
//     }
//   })
//   .where('id', `${searchId}`)
//   .then(results => {
//     console.log(results[0]);})
//   .catch(err => {
//     console.error(err);
//   });

//update note by id
// knex('notes')
//   .update(`${updateCol}`,`${updateVal}`)
//   .where('id', `${searchId}`)
//   .then(results => {
//     console.log(results);})
//   .catch(err => {
//     console.error(err);
//   });

//crete a note
// knex
//   .insert({title: `${newTitle}`, content: `${newContent}`})
//   .into('notes')
//   .returning('id', 'title', 'content')
//   .then(results => {
//     console.log(results);})
//   .catch(err => {
//     console.error(err);
//   });

//delete a note
// knex('notes')
//   .where('id', `${searchId}`)
//   .del()
//   .then(console.log)
//   .catch(err => {
//     console.error(err);
//   });