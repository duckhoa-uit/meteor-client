import React, { ReactNode, useState } from "react"

// import {
//   Button,
//   Card,
//   CardActions,
//   CardText,
//   CardTitle,
//   Dialog,
//   Icon,
// } from "vuetify/lib"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

interface ModalAcceptProps {
  fullscreen?: boolean
  large?: boolean
  children: ReactNode
  onAccept?: () => void
}

const ModalAccept: React.FC<ModalAcceptProps> = ({
  fullscreen = false,
  large = false,
  children,
  onAccept,
}) => {
  const [dialog, setDialog] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState<React.ReactNode | null>(null)
  const [icon] = useState("")

  const showModal = (
    modalTitle: string,
    modalMessage: React.ReactNode,
    modalIcon = ""
  ) => {
    setTitle(modalTitle)
    setMessage(modalMessage)
    // setIcon(modalIcon)
    setDialog(true)
  }

  const handleClose = () => {
    setDialog(false)
  }

  const handleAccept = () => {
    setDialog(false)
    if (onAccept) {
      onAccept()
    }
  }

  return (
    // <Dialog
    //   id="modalAccept"
    //   fullscreen={fullscreen}
    //   maxWidth={!large ? "500px" : "70%"}
    //   v-model={dialog}
    //   eager
    //   outside-click="onAccept"
    // >
    //   <Card>
    //     <CardTitle class="black text-h5 d-flex justify-space-between">
    //       <div class="text-h6 white--text">{title}</div>
    //       <Button icon onClick={handleClose}>
    //         <Icon color="#808080">mdi-close</Icon>
    //       </Button>
    //     </CardTitle>
    //     <CardText class="pa-5">{message}</CardText>
    //     <CardActions>
    //       {/* <v-spacer></v-spacer> */}
    //       <Button color="error" depressed onClick={handleAccept}>
    //         Accept
    //       </Button>
    //     </CardActions>
    //   </Card>
    // </Dialog>
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" value="@peduarte" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ModalAccept
