import { useEffect, useReducer, useState } from 'react';
import './App.css';

const COLUMNS = 8;
const ROWS = 8;
const FLAGS = 10;
const TOTAL = ROWS * COLUMNS;

const random = (max) => {
  return Math.floor(Math.random() * (max + 1));
}

const Button = ({value, state, onClick, onAuxClick}) => {
  return(
    <button 
      className={`button ${state ? 'grey' : 'blue'}`}
      onClick={onClick} 
      onAuxClick={onAuxClick}>
      {state && value !== 0 ? 
      (value === -1)  ? <i className="fas fa-bomb"></i> : value
      : ''}
    </button>
  );
}

const mapButton= (index) => {
  const around = [];
  const rowI = Math.floor(index / ROWS);
  const columnJ = index % COLUMNS;

  if(columnJ > 0){
    around.push(index - 1);
    if(rowI > 0){
      around.push(index - 1 - COLUMNS);
    }
  }

  if(rowI > 0){
    around.push(index - COLUMNS);
    if(columnJ < (COLUMNS - 1)){
      around.push(index - COLUMNS + 1);
    }    
  }

  if(columnJ < (COLUMNS - 1)){
    around.push(index + 1);
    if(rowI < (ROWS - 1)){
      around.push(index + COLUMNS + 1)
    }
  }

  if(rowI < (ROWS - 1)){
    around.push(index + COLUMNS);
    if(columnJ > 0){
      around.push(index + COLUMNS - 1);
    }
  }

  return around;
}

const generateButtons= (bombs) => {
  let buttons = Array.from(new Array(TOTAL));
  let num = 0;
  
  buttons = buttons.map((button, index) => ({
    value: 0,
    state: false,
    around: mapButton(index)
  }));
  
  while(bombs--){
    do{
      num = random(TOTAL);
    }while(buttons[num].value < 0);
    buttons[num].value = -1;
  }
  
  buttons = buttons.map((button) => ({
    ...button,
    value: button.value !== -1 ? 
           button.around.filter((elem) => buttons[elem].value === -1).length : 
           button.value
  }));

  console.log(buttons)

  return buttons;
}

const reducer = (state, action) => {
  switch(action.type){
    case 'set':
      return generateButtons(FLAGS);
    case 'changeState':
      if(!state[action.index].state){
        const newState = [...state];
        newState[action.index].state = true;
        const stack = [newState[action.index]];
        let currentButton = stack.pop();
        do{
          if(currentButton.value === 0){
            currentButton.around.forEach(element => {
              if(!newState[element].state){
                newState[element].state = true;
                if(newState[element].value === 0){
                  stack.push(newState[element]);
                }
              }
            });
            currentButton = stack.pop();
          }
        }while(stack.length > 0);
        return newState;
      }
      return state;
  }
}

function App() {

  const [time, setTime] = useState(0);
  const [flags, setFlags] = useState(FLAGS)
  const [buttons, dispatch] = useReducer(reducer, []);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    // Desativated Right-Click
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault(); 
    }, false);

    setInterval(()=>{
      setTime(time => time + 1)
    }, 1000);

    dispatch({type: 'set'});
  }, [])

  return (
    <>
      <header>
        <div className='header-container'>
          <div className='card'>
            <i className="fas fa-flag"></i>
            {flags < 10 ? '0' + flags : flags}
          </div>
          <div className='card-title'>
            <i className="fas fa-bomb"></i>
          </div>
          <div className='card'>
            <i className="fas fa-clock"></i>
            {time < 10 ? '0' + time : time}
          </div>
        </div>
      </header>
      <section>
        <div className='button-container'>
          {buttons.map((button, index) => (
            <Button 
              key={index} 
              {...button} 
              onClick={()=>{
                if(button.value === -1){
                  setModal(true)
                }else
                  dispatch({type: 'changeState', index})
              }} 
              onAuxClick={()=>console.log(button.around)}/>
          ))}
        </div>
      </section>

      {modal && <section className="modal-container">
                  <div className="modal">
                      <h2>YOU LOSE!</h2>
                      <button onClick={()=>window.location.href = window.location.href}>
                        <i class="fas fa-redo-alt"></i>
                      </button>
                  </div>
                </section>}
    </>
  );
}

export default App;
