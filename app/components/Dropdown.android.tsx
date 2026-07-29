import { useCallback, useEffect, useState } from "react"
import ArrowDownward from "@expo/material-symbols/arrow_drop_down.xml"
import ArrowUpward from "@expo/material-symbols/arrow_drop_up.xml"
import {
  BasicTextField,
  Box,
  DropdownMenuItem,
  ExposedDropdownMenu,
  ExposedDropdownMenuBox,
  Icon,
  Row,
  Text,
  useNativeState,
} from "@expo/ui/jetpack-compose"
import { fillMaxWidth, menuAnchor } from "@expo/ui/jetpack-compose/modifiers"

type DropdownProps = {
  title: string
  selectedValue: string
  onValueChange: (value: string) => void
  items: { label: string; value: string }[]
}

export function Dropdown({ title, selectedValue, onValueChange, items }: DropdownProps) {
  const [expanded, setExpanded] = useState(false)

  const getLabelFromSelectedValue = useCallback(() => {
    return items.find((item) => item.value === selectedValue)?.label ?? ""
  }, [items, selectedValue])

  const selectedValueNativeState = useNativeState(getLabelFromSelectedValue())

  useEffect(() => {
    selectedValueNativeState.set(getLabelFromSelectedValue())
  }, [selectedValue, selectedValueNativeState, getLabelFromSelectedValue, items])

  return (
    <ExposedDropdownMenuBox expanded={expanded} onExpandedChange={setExpanded}>
      <BasicTextField
        value={selectedValueNativeState}
        key={selectedValue}
        readOnly
        modifiers={[menuAnchor(), fillMaxWidth()]}
      >
        <BasicTextField.DecorationBox>
          <Row
            verticalAlignment="center"
            horizontalArrangement="spaceBetween"
            modifiers={[fillMaxWidth()]}
          >
            <Box>
              <BasicTextField.Placeholder>
                <Text>{title}</Text>
              </BasicTextField.Placeholder>
              <BasicTextField.InnerTextField />
            </Box>
            {expanded ? <Icon source={ArrowUpward} /> : <Icon source={ArrowDownward} />}
          </Row>
        </BasicTextField.DecorationBox>
      </BasicTextField>
      <ExposedDropdownMenu expanded={expanded} onDismissRequest={() => setExpanded(false)}>
        {items.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() => {
              onValueChange(item.value)
              setExpanded(false)
            }}
          >
            <DropdownMenuItem.Text>
              <Text>{item.label}</Text>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
        ))}
      </ExposedDropdownMenu>
    </ExposedDropdownMenuBox>
  )
}
