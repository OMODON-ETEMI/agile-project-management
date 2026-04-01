import { Board } from "@/src/helpers/type";
import React from 'react';
import Breadcrumbs from "@/src/component/breadcrumb";
import Header from "./header";

interface BoardHeaderProps{
    board : Board
}

export const BoardHeader = ({board} : BoardHeaderProps) => {
  const items=[
    { title: <a href="/Board/create" className="text-sm font-semibold">Board</a> },
    { title: <a href={`/Board/${board._id}`} className="text-sm font-semibold">{board.title}</a> }
  ]
    return(
        <>
          <Breadcrumbs items={items} /> 
          <Header /> 
        </>
    )
}