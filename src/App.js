import React from 'react';
import axios from "axios";
import { Container, Row, Col } from 'reactstrap';
import { FormGroup, Label, Input } from 'reactstrap';
import { Table } from 'reactstrap';
import { Alert } from 'reactstrap';
import {
  Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle
} from 'reactstrap';

const NODE_URL = (process.env.REACT_APP_NODE_BASE_URL) ? process.env.REACT_APP_NODE_BASE_URL : '';

function App() {

  const [filters, setFilters] = React.useState(<td></td>)
  const [cards, setCards] = React.useState(<></>)
  const [count, setCount] = React.useState({search: false, count: 0})
  const [selections, setSelections] = React.useState({})

  function handleChange(e, sels) {
    const filterId = e.target.getAttribute('data-filter')
    let s = selections
    if (e.target.type === 'select-multiple' || e.target.type === 'select-one'){
      var options = e.target.options;
      for (var i = 0, l = options.length; i < l; i++) {
        if (options[i].value !== ''){
          if (options[i].selected) {
            if (s[filterId] === undefined) s[filterId] = {}
            s[filterId][options[i].value] = true
            setSelections(s)           
          }
          else{
            if (s[filterId] === undefined) s[filterId] = {}
            s[filterId][options[i].value] = false
            setSelections(s)  
          }
        }
      }
    }
    else if (e.target.type === 'checkbox'){
      if (s[filterId] === undefined) s[filterId] = {}
      s[filterId][e.target.value] = e.target.checked
    }

    axios({
      url: NODE_URL + `/api/project-property/filter`,
      data: sels,
      method: 'post'
    }).then(res => {
      let rows = []
      let counts = 0
      if (res.data.results !== undefined && res.data.results.length){
        const r  = Math.ceil(res.data.results.length / 2)
        for (var a=0; a < r; a++){
          let cards = []
          for (var b=0; b < 2; b++){
            
            const project = res.data.results[counts]      
            let address = []
            let attributes = []
            for (var x = 0; x < project.propertyStringValues.length; x++){
              let value = project.propertyStringValues[x]
              if (['City', 'Country', 'State'].indexOf(value.property.name) >= 0){
                address.push(value.label)
              }
              else{
                attributes.push(<span key={Math.random().toString(36).substring(7)} style={{display: 'block'}}><label>{value.property.label}: </label> <strong>{value.label}</strong></span>)
              }
            }
            for (var x = 0; x < project.propertyIntegerValues.length; x++){
              let value = project.propertyIntegerValues[x]
              attributes.push(<span key={Math.random().toString(36).substring(7)} style={{display: 'block'}}><label>{value.property.label}: </label> <strong>{value.label}</strong></span>)
            }
            for (var x = 0; x < project.propertyDecimalValues.length; x++){
              let value = project.propertyDecimalValues[x]
              attributes.push(<span key={Math.random().toString(36).substring(7)} style={{display: 'block'}}><label>{value.property.label}: </label> <strong>{value.label}</strong></span>)
            }            
            let card =
              <Col sm="6" key={counts}>
                <Card key={project.id}>
                  {(project.pictures.length) 
                    ? <CardImg top width="100%" src={`/${project.pictures[0].filename}`} alt="Card image cap" /> 
                    : <CardImg top width="100%" src="/placeholder.jpg" alt="Card image cap" />
                  }
                  <CardBody>
                    <CardTitle>{project.name}</CardTitle>
                    <CardSubtitle><strong>{address.join(', ')}</strong></CardSubtitle>
                    <CardText>{attributes}</CardText>
                  </CardBody>
                </Card>
              </Col>
            cards.push(card)     
            if (res.data.results.length - 1 === counts){
              break
            }
            counts++
          }
          let row = <Row style={{marginBottom: '15px'}} key={a}>
            {cards}
          </Row>  
          rows.push(row)
        }
      }

      setCount({search: true, count: res.data.results.length})
      setCards(rows)

    }).catch(e => console.log(e));
  }

  async function init(){
    let sels = {}
    const res = await axios({
      url: NODE_URL + `/api/filter`,
      method: 'get'
    }).catch(e => console.log(e));

    if (res.data.results !== undefined && res.data.results.length){
      let tds = []
      for(var a=0; a<res.data.results.length; a++){
        const filter = res.data.results[a]
        let f = <></>
        let opts = []
        if (filter.fieldType === 'dropdown'){
          opts.push(<option value={''} key={`blank_${a}`}></option>)
        }
        sels[filter.id] = {}
        for (var b=0; b<filter.options.length; b++){
          const o = filter.options[b]
          if (filter.fieldType === 'dropdown' || filter.fieldType === 'dropdown-multiple'){
            opts.push(<option value={o.value} key={`${o.value}_${o.id}`}>{o.label}</option>)
          }
          else{
            opts.push(<div key={o.id}><Input onChange={(e) => {handleChange(e, selections)}} type="checkbox" value={o.value} style={{marginLeft: '0px', position: 'static'}} key={`${o.id}_${filter.id}`} data-filter={filter.id}/> {o.label}</div>)
          }
          sels[filter.id][o.value] = false
        }
        if (filter.fieldType === 'checkbox'){
          f = <FormGroup key={filter.id}>
              <Label style={{display: 'block'}}>{filter.label}</Label>
              {opts}
            </FormGroup>
        }          
        else if (filter.fieldType === 'dropdown-multiple'){
          f = <FormGroup key={filter.id}>
                <Label style={{display: 'block'}}>{filter.label}</Label>
                <Input type="select" name="select" key={`filter_${filter.id}`} data-filter={filter.id} onChange={(e) => {handleChange(e, selections)}} multiple>{opts}</Input>
              </FormGroup>
        }
        else{
          f = <FormGroup key={filter.id}>
                <Label style={{display: 'block'}}>{filter.label}</Label>
                <Input type="select" name="select" key={`filter_${filter.id}`} data-filter={filter.id} onChange={(e) => {handleChange(e, selections)}}>{opts}</Input>
              </FormGroup>            
        }
        tds.push(<td key={filter.id}>{f}</td>)
      }
      setFilters(tds)
    }

  }
  React.useEffect(() => {
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Container>
      <Row>
        <Col>
          <Table>
            <tbody>
              <tr>
                {filters}
              </tr>
            </tbody>
          </Table>        
        </Col>
      </Row>
      {count.search &&
      <Row>
        <Col>
          <Alert color="primary">
            {count.count} Projects found
          </Alert>       
        </Col>
      </Row>     
      }
      <Row>
        <Col>
          {cards}
        </Col>
      </Row>      
    </Container>    
  );
}

export default App;
