"use client"
import React from 'react';
import feedbackImage from '@/Assets/feedback.png';
import Tooltip from '@/src/component/tooltip';
import Button from '@/src/component/button';
import Image from 'next/image';

interface AboutTooltipProps {
    // Add any additional props here
  }

const AboutTooltip: React.FC<AboutTooltipProps> = (tooltipProps) => (
    <Tooltip
      width={250}
      {...tooltipProps}
      renderContent={() => (
    <div className="p-4 text-xs"> 
        <div className="max-w-15 mx-auto mb-3"> 
          <Image src={feedbackImage} alt="Give feedback" layout="responsive" />
        </div>
  
          <p className="mb-3 text-xs">
          This streamlined Jira clone is developed using Next.js (TypeScript) 
          and Tailwind CSS for the front-end, with Node.js and 
          MongoDB powering the back-end.
          </p>
  
          <p className="mb-3 text-xs">
            {'Read more on my website or reach out via '}
            <a href="mailto:ivor@codetree.co" className="font-bold">
              ivor@codetree.co
            </a>
          </p>
          <div className="flex space-x-2">
            <a
              href="https://getivor.com/"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Button variant="primary">Visit Website</Button>
            </a>
  
            <a
              href="https://github.com/oldboyxx/jira_clone"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Button icon="github">Github Repo</Button>
            </a>
          </div>
        </div>
      )}
      renderLink={({ref, onClick}) => (
        <div ref={ref} onClick={onClick} className='cursor-pointer'>
            <Button icon="feedback" variant="empty" iconSize={12}>
                Give feedback
            </Button>
        </div>
      )}
    />
  );
  
  export default AboutTooltip;
