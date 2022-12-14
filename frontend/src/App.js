import { useState, useEffect } from 'react';
import { Formik, FieldArray, Field, ErrorMessage } from 'formik';
import './App.css';

const Ordering = {
  doc: [
    ['title', 'Title', 'INVOICE'],
    ['comp', 'Company Name', 'Good Good Company'],
    ['addr1', 'Address 1', 'Address Line 1'],
    ['addr2', 'Address 2', 'Address Line 2'],
    ['addr3', 'Address 3', 'Address Line 3'],
    ['tel', 'Tel', '+852-23456789'],
    ['fax', 'Fax', '+852-23459876'],
    ['email', 'Email', 'def@abc.com'],
  ],
  contact: [
    ['comp', 'Company', 'Your Company Limited'],
    ['addr1', 'Address 1', 'Cust Address 1'],
    ['addr2', 'Address 2', 'Cust Address 2'],
    ['addr3', 'Address 3', 'Cust Address 3'],
    ['name', 'Contact Name', 'Mr Chan'],
    ['tel', 'Tel', '+852-21098765'],
    ['fax', 'Fax', '+852-21098777'],
    ['email', 'Email', 'okok@ok.com'],
  ],
  order: [
    ['date', 'Date', '2022/09/09'],
    ['nos', 'Order #', 'INV-220909001'],
    ['for', 'Order For', 'PO-220908001'],
    ['amount', 'Amount', '1,234.00'],
    ['remark', 'Remark', "0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n"],
  ],
};

let AllFields = {};

Object.keys(Ordering).forEach((n1) => {
  Ordering[n1].forEach((n2) => {
    AllFields[n1+'_'+n2[0]] = n2[2]
  })
});

AllFields['items'] = [
  { 'name': 'name 1', 'desc': 'desc 1', 'up': '1.11', 'qty': 1 },
  { 'name': 'name 2', 'desc': 'desc 2', 'up': '2.22', 'qty': 2 },
  { 'name': 'name 3', 'desc': 'desc 3', 'up': '3.33', 'qty': 3 },
];

function App() {

  const [status, setStatus] = useState(null);
  const [pagesize, setPagesize] = useState('small');
  const [datajson, setDatajson] = useState('{}');
  const [pdfbase64, setPdfbase64] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    try{
      fetch("/api/status")
        .then((response) => {
          return response.json();
        })
        .then((jsondata) => {
          setStatus(jsondata.message);
        });
    }catch(e){
      setStatus(JSON.stringify(e));
    }

  }, []);

  const getPDF = () => {

    setLoading(true);
    setPdfbase64('');

    fetch("/api/makeinv", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          PageSize: pagesize,
          datajson
        })
    })
    //.then(response => response.json)
    .then(response => response.blob())
    .then(blob => {

      //var blobToBase64 = function(blob, callback) {
      var reader = new FileReader();
      reader.onload = function() {
          var dataUrl = reader.result;
          setPdfbase64(dataUrl);
          //console.log(dataUrl);
          //var base64 = dataUrl.split(',')[1];
          //callback(base64);
          setLoading(false);
      };
      reader.readAsDataURL(blob);
      //};

    });
  }

  return (
    <div className="App">
      <div style={{display:'flex'}}>
        <div>
          <div>
            status : { JSON.stringify(status) }
          </div>
          <div>
            <Formik
              initialValues={{
                ...AllFields,
              }}
              validate={values => {

                let ttl = 0;
                values.items.forEach((v) => {
                  ttl = ttl + (v.qty * v.up);
                });
                values.order_amount = ttl.toFixed(2);

                setDatajson(JSON.stringify(values, null, 2));


                return {};
                //const errors = {};
                //if (!values.email) {
                //  errors.email = 'Required';
                //} else if (
                //  !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                //) {
                //  errors.email = 'Invalid email address';
                //}
                //return errors;
              }}
              onSubmit={(values, { setSubmitting }) => {
                setSubmitting(true);
                setTimeout(() => {
                  getPDF();
                  setSubmitting(false);
                }, 400);
              }}
            >
              {({
               values,
               errors,
               touched,
               handleChange,
               handleBlur,
               handleSubmit,
               isSubmitting,
               /* and other goodies */
               ...formHelpers
             }) => (
                <form onSubmit={handleSubmit} name='invoice_form' method='post' action='/api/makeinv' target='frame3'>
                  <input type='hidden' name='PageSize' onChange={ e => setPagesize(e.target.value) } value={pagesize} />
                  <input type='hidden' name='datajson' value={ datajson } onChange={ e => setDatajson(e.target.value) }  />

                  <h4>DOC</h4>
                  {
                    Ordering['doc'].map((n2, i) => (
                      <div key={ `Doc${i}` }>
                        { n2[1] } : <input type="text" name={ 'doc_'+n2[0] } onChange={handleChange} onBlur={handleBlur} value={values['doc_'+n2[0]]} />
                        <div>
                          { errors['doc_'+n2[0]] && touched['doc_'+n2[0]] && errors['doc_'+n2[0]] }
                        </div>
                      </div>
                    ))
                  }
                  <h4>Contact</h4>
                  {
                    Ordering['contact'].map((n2, i) => (
                      <div key={ `Contact${i}` }>
                        { n2[1] } : <input type="text" name={ 'contact_'+n2[0] } onChange={handleChange} onBlur={handleBlur} value={values['contact_'+n2[0]]} />
                        <div>
                          { errors['contact_'+n2[0]] && touched['contact_'+n2[0]] && errors['contact_'+n2[0]] }
                        </div>
                      </div>
                    ))
                  }
                  <h4>Order</h4>
                  {
                    Ordering['order'].map((n2, i) => (
                      <div key={ `Order${i}` }>
                        { n2[1] } : <input type="text" name={ 'order_'+n2[0] } onChange={handleChange} onBlur={handleBlur} value={values['order_'+n2[0]]} />
                        <div>
                          { errors['order_'+n2[0]] && touched['order_'+n2[0]] && errors['order_'+n2[0]] }
                        </div>
                      </div>
                    ))
                  }
                  <h4>Items</h4>
                  <FieldArray name="items">
                    {({ insert, remove, push, ...arrayHelpers }) => (
                      <div className="items">
                        <div className="row title">
                          <div className="col_name">Name</div>
                          <div className="col_desc">Description</div>
                          <div className="col_up">Unit Price</div>
                          <div className="col_qty">Qty</div>
                          <div className="col_amt">Amount</div>
                        </div>
                        {values.items.length > 0 &&
                          values.items.map((friend, index) => (
                            <div className="row" key={index}>
                              <div className="col_name">
                                <input
                                    type="text"
                                    name={`items.${index}.name`}
                                    value={values.items[index].name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                  />
                              </div>
                              <div className="col_desc">
                                <input
                                    type="text"
                                    name={`items.${index}.desc`}
                                    value={values.items[index].desc}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                  />
                              </div>
                              <div className="col_up">
                                <input
                                    type="text"
                                    name={`items.${index}.up`}
                                    value={values.items[index].up}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                  />
                              </div>
                              <div className="col_qty">
                                <input
                                    type="text"
                                    name={`items.${index}.qty`}
                                    value={values.items[index].qty}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                  />
                              </div>
                              <div className="col_amt">
                                {
                                  (parseFloat(values.items[index].up || 0) * parseFloat(values.items[index].qty || 0)).toFixed(2)
                                }
                              </div>
                              <div className="col">
                                <button
                                  type="button"
                                  className="secondary"
                                  onClick={() => remove(index)}
                                >
                                  X
                                </button>
                              </div>
                            </div>
                          ))
                        }
                        <div style={{textAlign: 'left'}}>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => push({ name: '', desc: '', up: '', qty: '' })}
                          >
                            Add Item
                          </button>
                        </div>
                      </div>
                    )}
                  </FieldArray>
                  <h4>Remark</h4>
                  <div>
                    <textarea cols="100" rows="10" name={ 'order_remark' } onChange={handleChange} onBlur={handleBlur} value={values['order_remark']} />
                  </div>
                <div>
                  <button type='submit' disabled={isSubmitting} onClick={ () => setPagesize('small') }>Smallest Size</button>
                  <button type='submit' disabled={isSubmitting} onClick={ () => setPagesize('regular') }>Regular Size</button>
                  <button type='submit' disabled={isSubmitting} onClick={ () => setPagesize('larger') }>Large Size</button>
                </div>
               </form>
             )}
            </Formik>
          </div>
        </div>
        {
          loading ? <div width='500'>Rendering Invoice from Server ...</div> : null
        }
        {
          pdfbase64 ? <embed src={ pdfbase64 }  type="application/pdf" width="500" height="780"></embed> : null
        }
      </div>
    </div>
  );
}

export default App;
