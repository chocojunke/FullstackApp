import { useState, useEffect } from 'react'
import personService from './services/services.js'
import './index.css'

const Person = ({persons, filter, deletePerson}) => {

  return (
    <>
      {
        persons
          .filter(element => element.name.toLowerCase().includes(filter.toLowerCase()) )
          .map(element => {
            return (
            <ul key={element.id}>
              <p key={element.id}>{element.name} - {element.number}</p>
              <button key={"button" + element.id} onClick={() => deletePerson(element.id)}>Delete</button>
            </ul>
          )})}

    </>
  )
}

const Filter = ({ filter, updateFilter }) => {

  return (
    <>
      Filter with: <input
                    value={filter}
                    onChange={updateFilter}
                  />
    </>
  )
}

const PersonForm = ({ newName, newNumber, updateName, updateNumber, saveContact }) => {
  return (
    <form>
      <div>
        name: <input 
                value={newName}
                onChange={updateName}
              />
      </div>
      <div>
        number: <input 
                value={newNumber}
                onChange={updateNumber}
              />
      </div>
      <div>
        <button onClick={saveContact}>add</button>
      </div>
    </form>
  )
}

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className='notification'>
      {message}
    </div>
  )
}

const Error = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className='error'>
      {message}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])

  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setNewFilter] = useState('')
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    personService
      .getAll()
      .then((event) => {
        //console.log(event);
        setPersons(event); 
      })
  }, [])

  const deletePerson = (id) => {
    if (window.confirm('Delete ' + persons.find(element => element.id === id).name + "?"))
    {
      personService
        .destroy(id)
        .then((_) => {
          setPersons(persons.filter(element => element.id !== id))
        })
    }
  }
  
  const updateName = (event) => {
    event.preventDefault();
    setNewName(event.target.value);
  }

  const updateNumber = (event) => {
    event.preventDefault();
    setNewNumber(event.target.value);
  }

  const updateFilter = (event) => {
    event.preventDefault();
    setNewFilter(event.target.value);
    persons.filter(element => element.name.includes(filter) )
  }

  const saveContact = (event) => {
    event.preventDefault();
    if (persons.findIndex(element => newName === element.name) === -1) {
      let person = {name: newName, number: newNumber, id: persons.length + 1};
      personService
        .create(person)
        .then((object) => {
          setMessage(object.name + " contact was added !");
          setTimeout(() => {
            setMessage(null)
          }, 5000)
          setPersons(persons.concat(object));
        })
    } else {
        if (window.confirm(persons.find(element => newName === element.name).name + "is already in the phonebbok. Replace number?"))
        {
          let oldPerson = persons.find(element => newName === element.name);
          let newPerson = { ...oldPerson, number: newNumber };

          personService
            .update(oldPerson.id, newPerson)
            .then((data) => {
              setMessage(data.name + " contact was modified !");
              setTimeout(() => {
                setMessage(null)
              }, 5000)
              setPersons(persons.map(element => element.name === newName ? data : element))
            })
            .catch(() => {
              setError("Information of " + oldPerson.name + " was not present in the server !");
              setTimeout(() => {
                setError(null)
              }, 5000)
            })
        }
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message}></Notification>
      <Error message={error}></Error>
      <Filter filter={filter} updateFilter={updateFilter}/>
      <h2>Add a new one</h2>
      <PersonForm newName={newName} newNumber={newNumber} updateName={updateName} updateNumber={updateNumber} saveContact={saveContact}/>
      <h2>Numbers</h2>
      <Person persons={persons} filter={filter} deletePerson={deletePerson}></Person>
    </div>
  )
}

export default App