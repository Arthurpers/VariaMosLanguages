import { createContext, useState } from "react";
import { CreatingMode } from "../../components/LanguageManager/index.types";

export const LanguageContext = createContext(null)

export default function LanguageContextProvider ({children}) {
  const [creatingMode, setCreatingMode] = useState<CreatingMode>("Graphical");
  const [abstractSyntax, setAbstractSyntax] = useState("");
  const [concreteSyntax, setConcreteSyntax] = useState("");
  const [semantics, setSemantics] = useState("");
  const [elements, setElements] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [restrictions, setRestrictions] = useState({
    unique_name: {
      elements:[[]]
    },
    parent_child: [],
    quantity_element: [],
  }); 

  const default_value = {
    creatingMode,
    setCreatingMode,
    elements,
    setElements,
    relationships,
    setRelationships,
    restrictions,
    setRestrictions,
    abstractSyntax,
    setAbstractSyntax,
    concreteSyntax,
    setConcreteSyntax,
    semantics,
    setSemantics,
  };

  return(
    <LanguageContext.Provider value={default_value}>{children}</LanguageContext.Provider>
  )
}

