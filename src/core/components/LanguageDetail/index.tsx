import { useEffect, useState, useContext } from "react";
import {
  Alert,
  Button,
  Form,
  InputGroup,
  ListGroup,
  Spinner,
  Container,
  Row,
} from "react-bootstrap";
import Comment from "./Comment/Comment";
import { capitalize, formatCode } from "./index.utils";
import ProjectService from "../../../Application/Project/ProjectService";
import { Language } from "../../../Domain/ProductLineEngineering/Entities/Language";
import { LanguageDetailProps } from "./index.types";
import config from "../LanguageManager/CreateLanguageButton/CreateLanguageButton.json";
import { LanguageContext } from "../../context/LanguageContext/LanguageContextProvider";
import { textualToGraphical } from "./GraphicalMode/SyntaxCompiler";
import TextualMode from "./TextualMode/TextualMode";
import GraphicalMode from "./GraphicalMode/GraphicalMode";

const DEFAULT_SYNTAX = "{}";
const DEFAULT_STATE_ACCEPT = "PENDING";
const DEFAULT_ELEMENTS = [];
const DEFAULT_RELATIONSHIPS = [];
const DEFAULT_RESTRICTIONS = {
  unique_name: {
    elements:[[]]
  },
  parent_child: [],
  quantity_element: [],
};

export default function LanguageDetail({
  language,
  isCreatingLanguage,
  setRequestLanguages,
}: LanguageDetailProps) {
  const [showSpinner, setShowSpinner] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showSuccessfulMessage, setShowSuccessfulMessage] = useState(false);
  const [disableSaveButton, setDisableSaveButton] = useState(false);
  const [errorMessage, setErrorMessage] = useState(String());
  const [languageName, setLanguageName] = useState(String());
  const [languageType, setLanguageType] = useState(String());
  const [semantics, setSemantics] = useState(String());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [comments, setComments] = useState([]);

  const{abstractSyntax, setAbstractSyntax, concreteSyntax, setConcreteSyntax,
     setElements, setRelationships, setRestrictions, creatingMode} = useContext(LanguageContext);
  
  useEffect(() => {
    if (isCreatingLanguage) {
      setLanguageName(String());
      setAbstractSyntax(DEFAULT_SYNTAX);
      setConcreteSyntax(DEFAULT_SYNTAX);
      setSemantics(DEFAULT_SYNTAX);
      setElements(DEFAULT_ELEMENTS);
      setRelationships(DEFAULT_RELATIONSHIPS);
      setRestrictions(DEFAULT_RESTRICTIONS);
    }}, [isCreatingLanguage, setAbstractSyntax, setConcreteSyntax, setElements, setRelationships, setRestrictions]);
  
  useEffect(()=>{
    if (language && !isCreatingLanguage) {
      setLanguageName(language.name||"");
      setLanguageType(capitalize(language.type));
      setAbstractSyntax(formatCode(language.abstractSyntax||DEFAULT_SYNTAX));
      setConcreteSyntax(formatCode(language.concreteSyntax||DEFAULT_SYNTAX));
      setSemantics(formatCode(language.semantics||DEFAULT_SYNTAX));
      if (creatingMode === config.modeGraphicalLabel){
        if (abstractSyntax && concreteSyntax)  {
          const { elements, relationships, restrictions } = textualToGraphical(abstractSyntax, concreteSyntax);
          if (elements) {
            setElements(elements);
          }
          if (relationships) {
            setRelationships(relationships);
          }
          if (restrictions) {
            setRestrictions(restrictions)
          } 
        }
      }
    }
    setShowErrorMessage(false);
    setShowSuccessfulMessage(false);
  }, [language, isCreatingLanguage, creatingMode, abstractSyntax, concreteSyntax, setAbstractSyntax, setConcreteSyntax, setElements, setRelationships, setRestrictions]);

  const handleServiceCallback = ({ messageError }) => {
    setShowSpinner(false);
    setDisableSaveButton(false);

    if (messageError) {
      setShowErrorMessage(true);
      setShowSuccessfulMessage(false);
      setErrorMessage(messageError);
      return;
    }

    setShowErrorMessage(false);
    setShowSuccessfulMessage(true);
    setErrorMessage("");
    setRequestLanguages(true);
  };

  const handleNameChange = (event) => {
    const currentName = event.target.value;
    setLanguageName(currentName);
  };

  const handleLanguageTypeChange = (event) => {
    const currentType = event.target.value;
    setLanguageType(currentType);
  };

  const handleSaveLanguage = () => {
    const service = new ProjectService();
    const currentLanguage: Language = {
      ...(isCreatingLanguage ? {} : { id: language?.id }),
      name: languageName,
      type: languageType.toUpperCase(),
      ...(isCreatingLanguage
        ? { stateAccept: DEFAULT_STATE_ACCEPT }
        : { stateAccept: language?.stateAccept }),
      abstractSyntax,
      concreteSyntax,
      semantics,
    };

    isCreatingLanguage
      ? service.createLanguage(handleServiceCallback, currentLanguage)
      : service.updateLanguage(
          handleServiceCallback,
          currentLanguage,
          String(language.id)
        );

    setShowSpinner(true);
    setDisableSaveButton(true);
  };

  if (!language && !isCreatingLanguage) {
    return (
      <Alert variant="primary" className="mb-3 mt-3">
        Please select a language from the left menu or select on "Create
        language" to create a new one.
      </Alert>
    );
  }

  return (
    <>
      <InputGroup className="mb-3 mt-3">
        <InputGroup.Text id="inputGroup-sizing-default">Name</InputGroup.Text>
        <Form.Control
          aria-label="Default"
          aria-describedby="inputGroup-sizing-default"
          value={languageName}
          onChange={handleNameChange}
        />
        <Form.Select
          aria-label="Default"
          aria-describedby="inputGroup-sizing-default"
          value={languageType}
          onChange={handleLanguageTypeChange}
        >
          <option>Domain</option>
          <option>Application</option>
          <option>Adaptation</option>
        </Form.Select>
      </InputGroup>
      {creatingMode === config.modeTextualLabel && (
        <TextualMode 
        />
      )}

      {creatingMode === config.modeGraphicalLabel && (
        <GraphicalMode/>
      )}
      

      <Container>
        <Row>
          <Button
            className="mb-3 mt-3"
            onClick={handleSaveLanguage}
            variant="primary"
            disabled={disableSaveButton}
          >
            Save
          </Button>
          {showSpinner && (
            <Container className="mb-3 mt-3 center">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </Container>
          )}
          {showErrorMessage && (
            <Alert variant="danger" className="mb-3 mt-3">
              {errorMessage}
            </Alert>
          )}
          {showSuccessfulMessage && (
            <Alert variant="success" className="mb-3 mt-3">
              Language saved successfuly.
            </Alert>
          )}
        </Row>
      </Container>

      <hr />
      <InputGroup className="mb-3">
        <InputGroup.Text id="inputGroup-sizing-default">Status</InputGroup.Text>
        <Form.Select
          aria-label="Default"
          aria-describedby="inputGroup-sizing-default"
        >
          <option>Pending</option>
          <option>Approved</option>
        </Form.Select>
      </InputGroup>
      <ListGroup>
        {comments.map((_, index) => {
          return (
            <ListGroup.Item key={index}>
              <Comment />
            </ListGroup.Item>
          );
        })}

        {!comments.length && (
          <Alert variant="secondary" className="mb-3 mt-3">
            There are no comments available.
          </Alert>
        )}
      </ListGroup>
    </>
  );
}
