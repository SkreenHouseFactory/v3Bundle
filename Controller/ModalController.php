<?php

/*
 * This file is part of the SkreenHouseFactoryV3Bundle package.
 *
 * (c) Brickstorm <http://brickstorm.org/>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace SkreenHouseFactory\v3Bundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\ExecutionContext;
use Symfony\Component\Validator\Constraints\Length;

use SkreenHouseFactory\v3Bundle\Api\ApiManager;
use SkreenHouseFactory\v3Bundle\Entity\Ident;

class ModalController extends Controller
{

    private $code_error;

    public function __toString(){
      return 'ModalController';
    }
    /**
    * publish playlist
    */
    public function publishplaylistAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryV3Bundle:Modal:publish-playlist.html.twig', array(
      ));
    }

    /**
    * signup
    */
    public function signupAction(Request $request)
    {

      $creation = array(
        'signin' => false,
        'session_uid' => $request->cookies->get('myskreen_session_uid')
        );

      $form = $this->createFormBuilder($creation, array(
          'constraints' => array(
              new Assert\Callback(array(array($this,'tryConnect')))
            )
        ))
        ->setAction($this->generateUrl('modal_signup'))
        ->add('email', 'email')
        ->add('password', 'password', array(
          'constraints' => new Length(array('min' => 4))
          ))
        ->add('session_uid', 'hidden')
        ->add('signin', 'hidden')
        ->add('inscription', 'submit')
        ->getForm();

      $form->handleRequest($request);
      $success = false;

      if($form->isValid()){
        $success = true;
      }

      $response = $this->render('SkreenHouseFactoryV3Bundle:Modal:signup.html.twig', array(
        'form' => $form->createView(),
        'success' => $success
        ));

      $cache_maxage=3600;
      $response->setCache(array(
          'max_age'       => $cache_maxage,
          's_maxage'      => $cache_maxage,
          'public'        => true,
      ));

      return $response;

    }

    /**
    * signin
    */
    public function signinAction(Request $request)
    {

      $identification = array(
        'signin' => true,
        'session_uid' => $request->cookies->get('myskreen_session_uid')
        );
      
      $form = $this->createFormBuilder($identification, array(
          'constraints' => array(
              new Assert\Callback(array(array($this,'tryConnect')))
            )
        ))
        ->setAction($this->generateUrl('modal_signin'))
        ->add('email', 'email')
        ->add('password', 'password', array(
          'constraints' => new Length(array('min' => 4))
          )) 
        ->add('session_uid', 'hidden')
        ->add('signin', 'hidden')
        ->add('valider', 'submit')
        ->getForm();

      $form->handleRequest($request);
      $success = false;

      if($form->isValid()){
        $success = true;
      }

      $response = $this->render('SkreenHouseFactoryV3Bundle:Modal:signin.html.twig', array(
        'form' => $form->createView(),
        'success' => $success
        ));

      $cache_maxage=3600;
      $response->setCache(array(
          'max_age'       => $cache_maxage,
          's_maxage'      => $cache_maxage,
          'public'        => true,
      ));
      
      return $response;
    }

    /**
    * mdp oublié
    */
    public function mdpAction(Request $request)
    {

      $form = $this->createFormBuilder($remind)
        ->setAction($this->generateUrl('remind_compte'))
        ->add('email', 'email')
        ->add('envoyer', 'submit')
        ->getForm();

      return $this->render('SkreenHouseFactoryV3Bundle:Modal:mdp.html.twig', array('form' => $form->createView()));
    }

    /**
    * connexion base
    */
    public static function tryConnect($data, ExecutionContext $context)
    {
      
      $api   = new ApiManager();
      $response = $api->fetch(
        '/api/2,3/user', 
        array(
          'session_uid'=>$data['session_uid'],
          'username'=>$data['email'],
          'password'=>$data['password'],
          'signin'=>$data['signin']
        ), 
        'POST', 
        array(
          'curl.CURLOPT_SSL_VERIFYHOST' => 0, 
          'curl.CURLOPT_SSL_VERIFYPEER' => 0
      ));

      if(!$response->success){
        switch ($response->code) {
          case 'no-user':
            $context->addViolation('Il n\'existe pas d\'utilisateur pour cet e-mail.', array('parameter'), 'invalidValue');
            break;
          case 'invalid-password':
            $context->addViolation('Mot de passe incorrect.', array('parameter'), 'invalidValue');
            break;
          case 'invalid-email':
            $context->addViolation('Adresse e-mail incorrecte.', array('parameter'), 'invalidValue');
            break;
          case 'already-logged-in':
            $context->addViolation('Vous êtes déjà connecté.', array('parameter'), 'invalidValue');
            break;
          case 'invalid-username':
            $context->addViolation('Cet e-mail est déjà enregistré.', array('parameter'), 'invalidValue');
            break;
        }
      }

    }

    /**
    * checkout
    */
    public function checkoutAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryV3Bundle:Modal:checkout.html.twig', array(
      ));
    }
}