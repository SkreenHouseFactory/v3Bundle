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
    * modal pass presentation
    */
    public function passAction(Request $request)
    {
      $pack_pass = null;

      if (!$request->isXmlHttpRequest()) {
        $api = $this->get('api');
        $params =  array(
          'channel_img_width' => 60,
          'img_width' => 150,
          'img_height' => 200,
          'fields' => 'programs,offers,player',
          'offers_type' => 'play',
          'player' => 'iframe',
          'allow_with' => true
        );
        $pack_pass = $api->fetch('www/slider/pack/13603363', $params);
      }
      
      $response = $this->render('SkreenHouseFactoryV3Bundle:Modal:pass.html.twig', array(
        'pack_pass'=> $pack_pass
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
    * signup
    */
    public function signupAction(Request $request)
    {

      $creation = array(
        'signin' => false,
        );

      $form = $this->createFormBuilder($creation, array(
          'constraints' => array(
              new Assert\Callback(array(array($this,'tryConnect')))
            )
        ))
        ->setAction($this->generateUrl('modal_signup'))
        ->add('email', 'email')
        ->add('password', 'password', array(
          //'constraints' => new Length(array('min' => 4))
          ))
        ->add('session_uid', 'hidden')
        ->add('signin', 'hidden')
        ->add('movieplay', 'hidden')
        ->add('inscription', 'submit')
        ->getForm();

      $form->handleRequest($request);
      $success = false;

      if($form->isValid()){
        $success = true;
      }

      $response = $this->render('SkreenHouseFactoryV3Bundle:Modal:signup.html.twig', array(
        'form' => $form->createView(),
        'success' => $success,
        'movieplay' => $this->getVideo($request)
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
        );
      
      $form = $this->createFormBuilder($identification, array(
          'constraints' => array(
              new Assert\Callback(array(array($this,'tryConnect')))
            )
        ))
        ->setAction($this->generateUrl('modal_signin'))
        ->add('email', 'email')
        ->add('password', 'password', array(
          //'constraints' => new Length(array('min' => 4))
          )) 
        ->add('session_uid', 'hidden')
        ->add('signin', 'hidden')
        ->add('movieplay', 'hidden')
        ->add('valider', 'submit')
        ->getForm();

      $form->handleRequest($request);
      $success = false;

      if($form->isValid()){
        $success = true;
      }

      $response = $this->render('SkreenHouseFactoryV3Bundle:Modal:signin.html.twig', array(
        'form' => $form->createView(),
        'success' => $success,
        'movieplay' => $this->getVideo($request)
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
    * connexion base
    */
    public static function tryConnect($data, ExecutionContext $context)
    {
      
      // Check longueur mot de passe
      if(strlen($data['password'])<4){
        $context->addViolation('Le mot de passe doit contenir au moins 4 caractères.', array('parameter'), 'invalidValue');
        return;
      }

      // MDP OK, on lance l'API
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
          //case 'already-logged-in':
            //$context->addViolation('Vous êtes déjà connecté.', array('parameter'), 'invalidValue');
            //break;
          case 'invalid-username':
            $context->addViolation('Cet e-mail est déjà enregistré.', array('parameter'), 'invalidValue');
            break;
        }
      }

    }


    /**
    * mdp oublié
    */
    public function mdpAction(Request $request)
    {
      $remind = array();

      $form = $this->createFormBuilder($remind, array(
          'constraints' => array(
              new Assert\Callback(array(array($this,'tryRemember')))
            )
        ))
        ->setAction($this->generateUrl('modal_mdp'))
        ->add('email', 'email')
        ->add('session_uid', 'hidden')
        ->add('movieplay', 'hidden')
        ->add('envoyer', 'submit')
        ->getForm();

      $form->handleRequest($request);
      $success = false;

      if($form->isValid()){
        $success = true;
      }
      
      $response = $this->render('SkreenHouseFactoryV3Bundle:Modal:mdp.html.twig', array(
        'form' => $form->createView(),
        'success' => $success,
        'movieplay' => $this->getVideo($request)
        ));

      $cache_maxage=3600;
      $response->setCache(array(
          'max_age'       => $cache_maxage,
          's_maxage'      => $cache_maxage,
          'public'        => true,
      ));

      return $response;
    }

    public static function tryRemember($data, ExecutionContext $context){

      $api   = new ApiManager();
      $response = $api->fetch(
        '/api/2,3/session/settings/'.$data['session_uid'], 
        array(
          'send_mail'=>'change_pwd',
          'username'=>$data['email'],
        ), 
        'GET', 
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

    private function getVideo(Request $request){

      if($request->get('movieplay')){
        $api = $this->get('api');
        $data = $api->fetch('player/' . $request->get('movieplay'), array(
          'img_width' => $request->get('width') ? (int)$request->get('width'): 'x',
          'img_height' => $request->get('height') ? (int)$request->get('height'): '500',
          'slider_width' => 1200,
          'slider_height' => 450,
          'with_program' => true,
          'with_img_size' => true
        ));
      return $data;
      }
      
    }

}